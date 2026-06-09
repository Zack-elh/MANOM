'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const services = [
  { id: 1, title: 'Signature Haircut', duration: '45 min', price: 45 },
  { id: 2, title: 'Royal Beard Sculpt', duration: '30 min', price: 35 },
  { id: 3, title: 'The Full Works', duration: '90 min', price: 95 },
  { id: 4, title: 'Hot Towel Shave', duration: '40 min', price: 40 },
  { id: 5, title: 'Scalp Treatment', duration: '30 min', price: 30 },
  { id: 6, title: 'Hair Design', duration: '60 min', price: 55 },
];

const barbers = [
  { id: 1, name: 'Andrew', specialty: 'Master Barber' },
  { id: 2, name: 'Enrique', specialty: 'Style Director' },
  { id: 3, name: 'Jake', specialty: 'Beard Specialist' },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

export default function BookingPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth');
    if (!auth) {
      router.push('/auth');
    } else {
      setAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  const toggleService = (id: number) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedServicesData = services.filter((s) => selectedServices.includes(s.id));
  const selectedBarberData = barbers.find((b) => b.id === selectedBarber);
  const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesData.reduce((sum, s) => sum + parseInt(s.duration), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-tertiary text-sm" style={{ fontFamily: 'var(--font-ui)' }}>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-black transition-colors text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>

        <span className="section-label">Book Appointment</span>
        <h1
          className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Book Your
          <br />
          Experience
        </h1>
        <p className="text-text-tertiary text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>
          Step {step} of 3
        </p>

        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-[2px] flex-1 transition-all duration-300 ${
                s <= step ? 'bg-black' : 'bg-black/10'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl text-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Select Services
            </h2>
            <p className="text-text-tertiary text-xs mb-6" style={{ fontFamily: 'var(--font-ui)' }}>
              Choose one or more services
            </p>
            <div className="space-y-0">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`w-full flex items-center justify-between py-5 border-b border-black/[0.08] text-left transition-colors ${
                      isSelected ? 'text-verdigris' : 'hover:text-verdigris'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium block" style={{ fontFamily: 'var(--font-ui)' }}>
                        {service.title}
                      </span>
                      <span className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                        {service.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-ui)' }}>
                        ${service.price}
                      </span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-verdigris bg-verdigris' : 'border-black/20'
                      }`}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-4 py-3 px-4 bg-surface-alt text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected · {totalDuration} min · ${totalPrice}
              </div>
            )}
            <button
              onClick={() => selectedServices.length > 0 && setStep(2)}
              disabled={selectedServices.length === 0}
              className="btn btn-primary w-full mt-8 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Select Barber
            </h2>
            <div className="space-y-0">
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`w-full flex items-center justify-between py-5 border-b border-black/[0.08] text-left transition-colors ${
                    selectedBarber === barber.id ? 'text-verdigris' : 'hover:text-verdigris'
                  }`}
                >
                  <div>
                    <span className="text-sm font-medium block" style={{ fontFamily: 'var(--font-ui)' }}>
                      {barber.name}
                    </span>
                    <span className="text-xs text-text-tertiary" style={{ fontFamily: 'var(--font-ui)' }}>
                      {barber.specialty}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedBarber === barber.id ? 'border-verdigris bg-verdigris' : 'border-black/20'
                  }`}>
                    {selectedBarber === barber.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => selectedBarber && setStep(3)}
                disabled={!selectedBarber}
                className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl text-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Select Date & Time
            </h2>

            <div className="mb-8">
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors"
                style={{ fontFamily: 'var(--font-ui)' }}
              />
            </div>

            <div className="mb-8">
              <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
                Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 text-xs font-medium border transition-all ${
                      selectedTime === time
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 hover:border-black/30'
                    }`}
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {selectedBarberData && selectedDate && selectedTime && (
              <div className="py-6 border-t border-black/[0.08] mb-8">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-ui)' }}>
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Services</span>
                    <span className="text-right">
                      {selectedServicesData.map((s) => s.title).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Barber</span>
                    <span>{selectedBarberData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Duration</span>
                    <span>{totalDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Date</span>
                    <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Time</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-black/[0.08] font-semibold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button
                disabled={!selectedDate || !selectedTime}
                className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
