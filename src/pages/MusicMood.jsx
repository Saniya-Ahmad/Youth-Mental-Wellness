import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Music, 
  Sparkles, 
  Loader2,
  Play,
  Heart,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MusicMood() {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [whyResonates, setWhyResonates] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ['musicMoods'],
    queryFn: () => base44.entities.MusicMood.list('-created_date', 10)
  });

  const saveMusicMood = useMutation({
    mutationFn: (data) => base44.entities.MusicMood.create(data),
    onSuccess: () => queryClient.invalidateQueries(['musicMoods'])
  });

  const handleAnalyze = async () => {
    if (!songTitle.trim()) return;
    
    setIsAnalyzing(true);
    
    const prompt = `Analyze the emotional resonance of this music selection for a mental wellness context.

Song: "${songTitle}" ${artist ? `by ${artist}` : ''}
${whyResonates ? `User's connection: "${whyResonates}"` : ''}

Provide:
1. A gentle, empathetic insight about what this song choice might reflect emotionally (2-3 sentences)
2. The detected mood/emotional state
3. 3 song suggestions that might complement their current emotional state - include a mix of validating their feelings and gently uplifting options

Remember: Be warm, non-judgmental, and supportive. Never pathologize music choices.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          insight: { type: 'string' },
          detected_mood: { type: 'string' },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                artist: { type: 'string' },
                mood: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setAnalysis(result);
    
    // Save to history
    saveMusicMood.mutate({
      song_title: songTitle,
      artist: artist,
      why_resonates: whyResonates,
      detected_mood: result.detected_mood,
      ai_insight: result.insight,
      suggested_songs: result.suggestions
    });

    setIsAnalyzing(false);
  };

  const moodColors = {
    'melancholic': 'from-blue-400 to-indigo-400',
    'anxious': 'from-violet-400 to-purple-400',
    'calm': 'from-teal-400 to-cyan-400',
    'energetic': 'from-amber-400 to-orange-400',
    'hopeful': 'from-emerald-400 to-green-400',
    'nostalgic': 'from-rose-400 to-pink-400',
    'sad': 'from-slate-400 to-gray-400',
    'peaceful': 'from-sky-400 to-blue-400',
    'default': 'from-violet-400 to-purple-400'
  };

  const getMoodColor = (mood) => {
    const key = Object.keys(moodColors).find(k => 
      mood?.toLowerCase().includes(k)
    );
    return moodColors[key] || moodColors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-violet-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Subtle Back Navigation */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
              <Music className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Music & Emotions</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              What's Playing in Your Heart?
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              The music we connect with often reflects how we feel inside. 
              Share a song that resonates with you right now.
            </p>
          </motion.div>
        </div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Song Title *
                    </label>
                    <Input
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g., Breathe Me"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Artist (Optional)
                    </label>
                    <Input
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="e.g., Sia"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Why does this song resonate with you? (Optional)
                  </label>
                  <Textarea
                    value={whyResonates}
                    onChange={(e) => setWhyResonates(e.target.value)}
                    placeholder="There's no right answer. Maybe it's the lyrics, the melody, or a memory it brings up..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!songTitle.trim() || isAnalyzing}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Understanding your vibe...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Explore My Music Mood
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Result */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getMoodColor(analysis.detected_mood)}`} />
                <CardContent className="p-8">
                  {/* Mood Badge */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getMoodColor(analysis.detected_mood)} text-white`}>
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{analysis.detected_mood}</span>
                    </div>
                  </div>

                  {/* Insight */}
                  <div className="text-center mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed">
                      {analysis.insight}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {analysis.suggestions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        You might also like
                      </h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {analysis.suggestions.map((song, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getMoodColor(song.mood)} flex items-center justify-center`}>
                                <Play className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-700 truncate">{song.title}</p>
                                <p className="text-sm text-slate-500 truncate">{song.artist}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              Your Music Journey
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {history.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMoodColor(entry.detected_mood)} flex items-center justify-center`}>
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-700 truncate">{entry.song_title}</p>
                        {entry.artist && (
                          <p className="text-sm text-slate-500 truncate">{entry.artist}</p>
                        )}
                        {entry.detected_mood && (
                          <p className="text-xs text-slate-400 mt-1">{entry.detected_mood}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}