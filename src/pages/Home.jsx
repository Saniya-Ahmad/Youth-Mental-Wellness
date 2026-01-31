import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ReassuranceSection from '@/components/home/ReassuranceSection';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HeroSection />
      <FeaturesSection />
      <ReassuranceSection />
      
      {/* Crisis Support Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-rose-700">Need immediate support?</span>
          </div>
          <p className="text-slate-600 mb-6">
            If you're in crisis or need to talk to someone right now, 
            help is always available. You don't have to face this alone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={createPageUrl('Chat')}>
              <Button className="bg-rose-500 hover:bg-rose-600 rounded-xl">
                Talk to AI Companion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Experts')}>
              <Button variant="outline" className="rounded-xl">
                Find a Professional
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
                MindfulSpace
              </h3>
              <p className="text-slate-400 text-sm mt-1">Your safe space for mental wellness</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to={createPageUrl('Home')} className="hover:text-white transition-colors">Home</Link>
              <Link to={createPageUrl('Chat')} className="hover:text-white transition-colors">Chat</Link>
              <Link to={createPageUrl('Community')} className="hover:text-white transition-colors">Community</Link>
              <Link to={createPageUrl('Experts')} className="hover:text-white transition-colors">Experts</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>Remember: You are not alone. Help is always available.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}