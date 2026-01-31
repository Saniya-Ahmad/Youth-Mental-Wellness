import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExpertCard from '@/components/experts/ExpertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Shield,
  Loader2,
  Check,
  CalendarDays,
  Clock,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const specializations = [
  'Anxiety', 'Depression', 'Stress Management', 'Relationships',
  'Self-Esteem', 'Trauma', 'Academic Pressure', 'Family Issues',
  'Grief', 'Life Transitions'
];

export default function Experts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);

  const queryClient = useQueryClient();

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ['experts'],
    queryFn: () => base44.entities.Expert.list()
  });

  const createBooking = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setBookingComplete(true);
    }
  });

  const handleBook = (expert) => {
    setSelectedExpert(expert);
    setBookingStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingNotes('');
    setBookingComplete(false);
  };

  const handleConfirmBooking = () => {
    createBooking.mutate({
      expert_id: selectedExpert.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTime,
      notes: bookingNotes,
      is_anonymous: true
    });
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = !searchQuery || 
      expert.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterSpecialization === 'all' || 
      expert.specializations?.includes(filterSpecialization);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Verified Professionals</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              Professional Support
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Connect with verified mental health professionals. 
              All sessions are confidential and can be booked anonymously.
            </p>
          </motion.div>
        </div>

        {/* Privacy Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">Anonymous Booking Available</h3>
            <p className="text-sm text-slate-500">
              You can book sessions without sharing your real name. Your privacy is our priority.
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or specialization..."
              className="pl-12 h-12 rounded-xl border-slate-200"
            />
          </div>
          <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
            <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No experts found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                onBook={handleBook}
              />
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {bookingComplete ? 'Booking Confirmed!' : `Book with ${selectedExpert?.name}`}
              </DialogTitle>
            </DialogHeader>

            {bookingComplete ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  You're all set!
                </h3>
                <p className="text-slate-600 mb-2">
                  Your session with {selectedExpert?.name} is booked for:
                </p>
                <p className="font-medium text-teal-600">
                  {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </p>
                <Button
                  onClick={() => setSelectedExpert(null)}
                  className="mt-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="py-4">
                {bookingStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-5 h-5 text-teal-500" />
                      <span className="font-medium text-slate-700">Select a Date</span>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-xl border mx-auto"
                    />
                    <Button
                      onClick={() => setBookingStep(2)}
                      disabled={!selectedDate}
                      className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl"
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}

                {bookingStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <span className="font-medium text-slate-700">Select a Time</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-xl ${selectedTime === slot ? 'bg-teal-500' : ''}`}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBookingStep(1)}
                        className="flex-1 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setBookingStep(3)}
                        disabled={!selectedTime}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl"
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {bookingStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="mb-4 bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-500">Date</span>
                          <span className="font-medium text-slate-700">
                            {format(selectedDate, 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Time</span>
                          <span className="font-medium text-slate-700">{selectedTime}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="mb-4">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Anything you'd like to share beforehand? (Optional)
                      </label>
                      <Textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="This helps your therapist prepare for your session..."
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setBookingStep(2)}
                        className="flex-1 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={createBooking.isPending}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl"
                      >
                        {createBooking.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Confirm Booking
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}