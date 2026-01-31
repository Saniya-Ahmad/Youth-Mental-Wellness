import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MoodEmoji, { moodConfig } from '@/components/ui/MoodEmoji';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  BookOpen, 
  Calendar,
  ChevronRight,
  Loader2,
  Check,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const activities = [
  { id: 'exercise', emoji: '🏃', label: 'Exercise' },
  { id: 'sleep', emoji: '😴', label: 'Good Sleep' },
  { id: 'social', emoji: '👥', label: 'Socializing' },
  { id: 'nature', emoji: '🌿', label: 'Nature' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'work', emoji: '💼', label: 'Work/Study' },
  { id: 'rest', emoji: '🛋️', label: 'Rest' },
  { id: 'music', emoji: '🎵', label: 'Music' },
];

export default function MoodCheckIn() {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalType, setJournalType] = useState('quick_note');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();

  const { data: recentEntries } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-created_date', 7)
  });

  const createEntry = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moodEntries']);
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const entryData = {
      mood: selectedMood,
      intensity,
      activities: selectedActivities,
      journal_entry: journalEntry,
      journal_type: journalType
    };

    // Get AI analysis if there's a journal entry
    if (journalEntry.trim()) {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this journal entry for emotional themes and sentiment. Be gentle and supportive in your analysis.
        
Entry: "${journalEntry}"
Selected mood: ${selectedMood}
Activities: ${selectedActivities.join(', ')}

Return a brief, empathetic analysis.`,
        response_json_schema: {
          type: 'object',
          properties: {
            sentiment: { type: 'string' },
            themes: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      entryData.ai_sentiment = analysis.sentiment;
      entryData.ai_themes = analysis.themes;
    }

    await createEntry.mutateAsync(entryData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const toggleActivity = (id) => {
    setSelectedActivities(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-violet-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Check-in complete 💫
          </h2>
          <p className="text-slate-600 mb-8">
            Thank you for taking a moment to reflect. 
            Every check-in helps you understand yourself better.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setSelectedMood(null);
                setSelectedActivities([]);
                setJournalEntry('');
              }}
              className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl"
            >
              Start Another Check-in
            </Button>
            <Button 
              variant="outline"
              onClick={() => setStep(5)}
              className="rounded-xl"
            >
              View History
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-violet-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Subtle Back Navigation */}
        {!submitted && (
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
        )}

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              animate={{ 
                scale: step === s ? 1.2 : 1,
                backgroundColor: step >= s ? '#14b8a6' : '#e2e8f0'
              }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Mood Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                How are you feeling?
              </h1>
              <p className="text-slate-600 mb-10">
                There's no right or wrong answer. Just check in with yourself.
              </p>
              
              <div className="grid grid-cols-4 gap-4 mb-10">
                {Object.keys(moodConfig).map((mood) => (
                  <MoodEmoji
                    key={mood}
                    mood={mood}
                    selected={selectedMood === mood}
                    onClick={setSelectedMood}
                  />
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedMood}
                className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl px-8"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Intensity */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                How intense is this feeling?
              </h1>
              <p className="text-slate-600 mb-10">
                Sometimes feelings are subtle, sometimes they're overwhelming.
              </p>

              <div className="flex items-center justify-center gap-4 mb-10">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setIntensity(level)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 rounded-2xl font-semibold transition-all ${
                      intensity === level
                        ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-lg'
                        : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mb-8">
                1 = barely there, 5 = very strong
              </p>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl px-8"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Activities */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                What's been part of your day?
              </h1>
              <p className="text-slate-600 mb-10">
                Select any that apply. This helps you notice patterns.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                {activities.map((activity) => (
                  <motion.button
                    key={activity.id}
                    onClick={() => toggleActivity(activity.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-2xl transition-all ${
                      selectedActivities.includes(activity.id)
                        ? 'bg-teal-50 border-2 border-teal-200'
                        : 'bg-white border-2 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{activity.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{activity.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl px-8"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Journal */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                  Want to write about it?
                </h1>
                <p className="text-slate-600">
                  Totally optional. Sometimes putting thoughts into words helps.
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                <Button
                  variant={journalType === 'quick_note' ? 'default' : 'outline'}
                  onClick={() => setJournalType('quick_note')}
                  className={`rounded-xl ${journalType === 'quick_note' ? 'bg-teal-500' : ''}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Quick Note
                </Button>
                <Button
                  variant={journalType === 'reflection' ? 'default' : 'outline'}
                  onClick={() => setJournalType('reflection')}
                  className={`rounded-xl ${journalType === 'reflection' ? 'bg-teal-500' : ''}`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Reflection
                </Button>
              </div>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder={journalType === 'quick_note' 
                      ? "Just a few words about how you're feeling..."
                      : "Take your time. What's on your mind? What happened today? How does it make you feel?"
                    }
                    className="min-h-[150px] border-0 focus-visible:ring-0 resize-none text-slate-700 placeholder:text-slate-400"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="rounded-xl">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Check-in
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Entries */}
        {recentEntries?.length > 0 && step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              Recent Check-ins
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {recentEntries.map((entry) => (
                <Card key={entry.id} className="flex-shrink-0 w-32">
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl mb-2 block">
                      {moodConfig[entry.mood]?.emoji || '😐'}
                    </span>
                    <p className="text-xs text-slate-500">
                      {format(new Date(entry.created_date), 'MMM d')}
                    </p>
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