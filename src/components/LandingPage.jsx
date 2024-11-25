import React from 'react';
import { Heart, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-[#D3A6B8]" />
          <h1 className="text-4xl md:text-5xl font-serif text-[#4A3B52]">
            Perfect Seating, Perfect Wedding
          </h1>
        </div>
        <p className="text-xl text-[#6B5A74] max-w-2xl mx-auto mb-8 font-serif">
          Create beautiful, intuitive seating arrangements for your special day with our elegant drag-and-drop seating chart planner.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D3A6B8] text-white rounded-full hover:bg-[#C295A7] transition-all duration-300 shadow-lg hover:shadow-xl font-serif text-lg"
        >
          Let's Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <FeatureCard
          title="Drag & Drop Design"
          description="Effortlessly arrange tables and guests with our intuitive drag-and-drop interface."
          image="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=500"
        />
        <FeatureCard
          title="Multiple Layouts"
          description="Save and manage different seating arrangements for various wedding events."
          image="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=500"
        />
        <FeatureCard
          title="Guest Management"
          description="Easily organize guests, track RSVPs, and manage dietary preferences."
          image="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=500"
        />
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-serif text-[#4A3B52] text-center mb-8">How It Works</h2>
        <div className="space-y-6">
          <Step number="1" title="Create Your Event" description="Choose your event type and start with a blank canvas." />
          <Step number="2" title="Add Tables & Furniture" description="Drag and drop tables, dance floors, and other elements." />
          <Step number="3" title="Arrange Your Guests" description="Easily assign seats and manage guest preferences." />
          <Step number="4" title="Save & Share" description="Save your layout and share it with your wedding planner." />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, image }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 duration-300">
    <img src={image} alt={title} className="w-full h-48 object-cover" />
    <div className="p-6">
      <h3 className="text-xl font-serif text-[#4A3B52] mb-2">{title}</h3>
      <p className="text-[#6B5A74]">{description}</p>
    </div>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex items-start gap-4 bg-white/50 p-6 rounded-xl">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-[#D3A6B8] rounded-full flex items-center justify-center text-white font-serif">
        {number}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-serif text-[#4A3B52] mb-1">{title}</h3>
      <p className="text-[#6B5A74]">{description}</p>
    </div>
  </div>
);