import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { moodConfig } from '@/components/ui/MoodEmoji';
import { 
  User, 
  Heart, 
  Calendar,
  Music,
  MessageCircle,
  Shield,
  TrendingUp,
  Loader2,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-created_date', 30)
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 10)
  });

  const { data: musicMoods = [] } = useQuery({
    queryKey: ['musicMoods'],
    queryFn: () => base44.entities.MusicMood.list('-created_date', 10)
  });

  // Generate mood summary
  const getMoodSummary = () => {
    if (moodEntries.length === 0) return null;
    
    const moodCounts = {};
    moodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const sortedMoods = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a);
    
    return {
      topMood: sortedMoods[0]?.[0],
      totalEntries: moodEntries.length,
      moodCounts
    };
  };

  const moodSummary = getMoodSummary();

  // Generate 7-day mood calendar
  const getLast7Days = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    
    return days.map(day => {
      const entry = moodEntries.find(e => 
        format(new Date(e.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        date: day,
        mood: entry?.mood,
        hasEntry: !!entry
      };
    });
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Subtle Back Navigation */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-400 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {user?.full_name || 'Your Space'}
                </h1>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mood Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Your Mood Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodSummary ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 mb-1">Most frequent mood</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{moodConfig[moodSummary.topMood]?.emoji}</span>
                        <span className="font-medium text-slate-700">
                          {moodConfig[moodSummary.topMood]?.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* 7-Day Calendar */}
                    <p className="text-sm text-slate-500 mb-3">Last 7 days</p>
                    <div className="flex gap-2">
                      {getLast7Days().map((day, i) => (
                        <div key={i} className="flex-1 text-center">
                          <div className="text-xs text-slate-400 mb-1">
                            {format(day.date, 'EEE')}
                          </div>
                          <div className={`h-12 rounded-lg flex items-center justify-center ${
                            day.hasEntry 
                              ? moodConfig[day.mood]?.bgColor || 'bg-slate-100'
                              : 'bg-slate-50 border-2 border-dashed border-slate-200'
                          }`}>
                            {day.hasEntry ? (
                              <span className="text-lg">{moodConfig[day.mood]?.emoji}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-center text-sm text-slate-500 mt-4">
                      {moodSummary.totalEntries} check-ins recorded
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">No mood entries yet</p>
                    <p className="text-sm text-slate-400">Start your first check-in to track your journey</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Your Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <span className="text-slate-700">Mood Check-ins</span>
                  </div>
                  <span className="font-semibold text-slate-800">{moodEntries.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-slate-700">Sessions Booked</span>
                  </div>
                  <span className="font-semibold text-slate-800">{bookings.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Music className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-slate-700">Music Moods</span>
                  </div>
                  <span className="font-semibold text-slate-800">{musicMoods.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-teal-500" />
                  Privacy & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700">Anonymous in Community</p>
                    <p className="text-sm text-slate-500">Your posts will show a random name</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700">Daily Check-in Reminders</p>
                    <p className="text-sm text-slate-500">Gentle reminders to check in with yourself</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700">Data Analytics</p>
                    <p className="text-sm text-slate-500">Help improve the app with anonymous usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Journal Entries */}
          {moodEntries.some(e => e.journal_entry) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5 text-violet-500" />
                    Recent Journal Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moodEntries
                      .filter(e => e.journal_entry)
                      .slice(0, 3)
                      .map((entry) => (
                        <div key={entry.id} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{moodConfig[entry.mood]?.emoji}</span>
                            <span className="text-sm text-slate-500">
                              {format(new Date(entry.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-slate-700 line-clamp-2">{entry.journal_entry}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
