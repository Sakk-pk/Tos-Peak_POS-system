import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
  Settings, Info, QrCode, X, Star, ArrowRight, HelpCircle, ArrowLeft
} from 'lucide-react';

const VOUCHERS = [
  { id: 'v1', name: '$10 OFF VOUCHER', pts: 80, desc: 'Receive a $10 discount code for your next order.', code: 'PEAK10' },
  { id: 'v2', name: '20% OFF DISCOUNT', pts: 150, desc: 'Get 20% off any sneakers in our catalog.', code: 'PEAK20' },
  { id: 'v3', name: 'FREE DELIVERY VOUCHER', pts: 40, desc: 'Waive any delivery costs in Cambodia.', code: 'PEAKFREE' }
];

export default function ProfileDrawer({ showUserDrawer, setShowUserDrawer, user }) {
  // Sync state to LocalStorage for persistent rewards simulation
  const [memberPoints, setMemberPoints] = useState(() => {
    try {
      const stored = localStorage.getItem('tos_member_points');
      return stored ? parseInt(stored, 10) : 100;
    } catch (_) {
      return 100;
    }
  });

  const [redeemedVouchers, setRedeemedVouchers] = useState(() => {
    try {
      const stored = localStorage.getItem('tos_redeemed_vouchers');
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  });

  const [showPointsHelp, setShowPointsHelp] = useState(false);
  const [drawerView, setDrawerView] = useState('main'); // 'main' | 'rewards'

  const [shouldRender, setShouldRender] = useState(showUserDrawer);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    localStorage.setItem('tos_member_points', String(memberPoints));
  }, [memberPoints]);

  useEffect(() => {
    localStorage.setItem('tos_redeemed_vouchers', JSON.stringify(redeemedVouchers));
  }, [redeemedVouchers]);

  useEffect(() => {
    if (showUserDrawer) {
      setShouldRender(true);
      // Reset view to main when opened
      setDrawerView('main');
      const timer = setTimeout(() => setIsMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showUserDrawer]);

  if (!shouldRender) return null;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const myRedeemedList = VOUCHERS.filter(v => redeemedVouchers.includes(v.id));

  return (
    <>
      {/* Dark backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setShowUserDrawer(false)}
      />
      
      {/* Drawer panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] bg-[#F5F5F0] flex flex-col shadow-2xl transition-transform duration-300 ease-out transform text-[#111111] ${isMounted ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Upper Segment (Warm gray background) */}
          <div className="p-6 space-y-6 shrink-0">
              
              {/* Header row */}
              <div className="flex items-center justify-between">
                  {drawerView !== 'main' ? (
                    <button 
                      onClick={() => setDrawerView('main')}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                  ) : (
                    <span className="text-[20px] font-black uppercase tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
                        tos-peak club
                    </span>
                  )}
                  
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={() => setShowUserDrawer(false)}
                          className="text-neutral-500 hover:text-black transition p-1 hover:bg-neutral-200"
                          aria-label="Close Profile"
                      >
                          <X size={18} className="stroke-[2.5]" />
                      </button>
                  </div>
              </div>

              {drawerView === 'main' ? (
                <>
                  {user ? (
                      <>
                          {/* Member Points Card */}
                          <div className="flex items-center gap-4 bg-white/40 p-4 border border-black/5 relative">
                              <div className="flex h-11 w-11 items-center justify-center bg-black text-white rounded-full shrink-0">
                                  <Star size={20} className="fill-white" />
                              </div>
                              <div>
                                  <span className="text-[32px] font-black text-neutral-955 text-neutral-950 leading-none block">
                                      {memberPoints}
                                  </span>
                                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mt-0.5">
                                      Points to spend
                                  </span>
                              </div>
                              
                              {/* Help trigger circular button */}
                              <button 
                                  onClick={() => setShowPointsHelp(!showPointsHelp)}
                                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black transition"
                                  aria-label="How to earn points"
                              >
                                  <HelpCircle size={15} />
                              </button>
                              
                              {showPointsHelp && (
                                  <div className="bg-neutral-950 text-white text-[10.5px] font-semibold p-4 absolute left-4 right-4 top-16 z-30 border border-neutral-800 shadow-2xl leading-relaxed animate-fade-in rounded-none">
                                      <div className="flex justify-between items-center mb-1.5 border-b border-white/10 pb-1">
                                          <span className="font-black uppercase tracking-wider text-amber-500">How to get points:</span>
                                          <button onClick={() => setShowPointsHelp(false)} className="text-white/60 hover:text-white transition">
                                              <X size={12} />
                                          </button>
                                      </div>
                                      <ul className="list-disc pl-3.5 space-y-1 text-white/90">
                                          <li>Earn 1 point for every $1 spent on any sneaker purchase.</li>
                                          <li>Points are credited automatically after checkout is calibrated.</li>
                                          <li>Special events and new brand releases award double points.</li>
                                      </ul>
                                  </div>
                              )}
                          </div>

                          {/* Quick Link Row stack */}
                          <div className="flex flex-col gap-3.5 pt-2">
                              <Link 
                                  href={route('account.settings')}
                                  onClick={() => setShowUserDrawer(false)}
                                  className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-neutral-900 border-b border-black/5 pb-2 group no-underline hover:no-underline"
                              >
                                  <span className="group-hover:underline">My Account</span>
                                  <ArrowRight size={14} />
                              </Link>

                              <Link 
                                  href={route('my-orders.index')}
                                  onClick={() => setShowUserDrawer(false)}
                                  className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-neutral-900 border-b border-black/5 pb-2 group no-underline hover:no-underline"
                              >
                                  <span className="group-hover:underline">My Orders</span>
                                  <ArrowRight size={14} />
                              </Link>
                              
                              <div 
                                  onClick={() => setDrawerView('rewards')}
                                  className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-neutral-900 border-b border-black/5 pb-2 cursor-pointer group"
                              >
                                  <span className="group-hover:underline">My Rewards</span>
                                  <ArrowRight size={14} />
                              </div>

                              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-neutral-900 hover:text-neutral-900 border-b border-black/5 pb-2 cursor-pointer group">
                                  <span className="group-hover:underline">Points History</span>
                                  <ArrowRight size={14} />
                              </div>
                          </div>
                      </>
                  ) : (
                      <>
                          {/* Logged Out Call to Action */}
                          <div className="space-y-4 py-4">
                              <h3 className="text-[18px] font-black uppercase tracking-tight text-neutral-955 text-neutral-955 text-neutral-950">
                                  Unlock Your Member Status
                              </h3>
                              <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                                  Join the TOS-PEAK Club today to collect points, redeem exclusive sneakers, and receive personalized calibrations.
                              </p>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                  <Link
                                      href={route('login')}
                                      onClick={() => setShowUserDrawer(false)}
                                      className="w-full flex h-11 items-center justify-center bg-black hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-widest no-underline hover:no-underline"
                                  >
                                      Log In
                                  </Link>
                                  <Link
                                      href={route('register')}
                                      onClick={() => setShowUserDrawer(false)}
                                      className="w-full flex h-11 items-center justify-center bg-white border border-black text-black hover:bg-neutral-50 text-xs font-black uppercase tracking-widest no-underline hover:no-underline"
                                  >
                                      Join Us
                                  </Link>
                              </div>
                          </div>
                      </>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-[32px] font-black uppercase tracking-tight text-neutral-955 text-neutral-955 text-neutral-950 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                    my rewards
                  </h3>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    Your active vouchers and discount codes
                  </p>
                </div>
              )}

          </div>

          {/* Lower Segment */}
          <div className="bg-white flex-1 flex flex-col p-6 overflow-hidden min-h-0 border-t border-neutral-200">
              
              {drawerView === 'main' ? (
                <>
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-950 pb-2.5 border-b border-neutral-100 mb-4 shrink-0">
                      Voucher Shop
                  </div>

                  <div className="flex-1 overflow-y-auto pt-1 space-y-4 pr-1 scrollbar-none">
                      <div className="space-y-4">
                          {VOUCHERS.map(v => {
                              const isRedeemed = redeemedVouchers.includes(v.id);
                              const canAfford = memberPoints >= v.pts;
                              
                              return (
                                  <div key={v.id} className="border border-neutral-200 p-4 rounded-none bg-white flex flex-col justify-between gap-3 hover:border-black transition">
                                      <div className="space-y-1">
                                          <div className="flex justify-between items-baseline">
                                              <h4 className="text-[12px] font-black text-neutral-955 text-neutral-950 uppercase">{v.name}</h4>
                                              <span className="text-[11px] font-black text-emerald-600 shrink-0">{v.pts} PTS</span>
                                          </div>
                                          <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">{v.desc}</p>
                                      </div>
                                      
                                      {isRedeemed ? (
                                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-center py-2 px-3 text-[10px] font-bold tracking-widest uppercase">
                                              Redeemed: CODE <span className="font-black underline select-all bg-emerald-100/50 px-1.5 py-0.5">{v.code}</span>
                                          </div>
                                      ) : (
                                          <button
                                              disabled={!canAfford}
                                              onClick={() => {
                                                  setMemberPoints(prev => prev - v.pts);
                                                  setRedeemedVouchers(prev => [...prev, v.id]);
                                                  window.dispatchEvent(new CustomEvent('toast', {
                                                      detail: { message: `Successfully redeemed! Use code ${v.code} at checkout.`, type: 'success' }
                                                  }));
                                              }}
                                              className={`w-full py-2 text-[10px] font-black uppercase tracking-widest transition text-center ${
                                                  canAfford
                                                      ? 'bg-black text-white hover:bg-neutral-800'
                                                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                              }`}
                                          >
                                              {canAfford ? 'Redeem Voucher' : `Need ${v.pts} Points`}
                                          </button>
                                      )}
                                  </div>
                              );
                          })}
                      </div>

                      {user && (
                          <div className="pt-4">
                              <Link 
                                  href={route('logout')} 
                                  method="post" 
                                  as="button" 
                                  onClick={() => setShowUserDrawer(false)}
                                  className="w-full text-center py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 border border-dashed border-red-200 transition"
                              >
                                  Log Out
                              </Link>
                          </div>
                      )}
                  </div>
                </>
              ) : (
                // MY REWARDS SUBVIEW
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-955 text-neutral-950 pb-2.5 border-b border-neutral-100 mb-4 shrink-0">
                      Redeemed Rewards
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pt-1 space-y-4 pr-1 scrollbar-none">
                    {myRedeemedList.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 space-y-3">
                          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                              <Star size={20} />
                          </div>
                          <p className="text-xs font-black uppercase tracking-wider text-neutral-900">No Rewards Yet</p>
                          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed max-w-[240px]">
                              Redeem your member points in the Voucher Shop to unlock discount vouchers here.
                          </p>
                          <button 
                              onClick={() => setDrawerView('main')}
                              className="mt-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition"
                          >
                              Go to Shop
                          </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                          {myRedeemedList.map(v => (
                              <div key={v.id} className="border border-neutral-200 p-4 rounded-none bg-neutral-50 flex flex-col justify-between gap-3.5 hover:border-black transition">
                                  <div className="space-y-1">
                                      <div className="flex justify-between items-baseline">
                                          <h4 className="text-[12px] font-black text-neutral-955 text-neutral-950 uppercase">{v.name}</h4>
                                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">Active</span>
                                      </div>
                                      <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">{v.desc}</p>
                                  </div>
                                  
                                  <div className="bg-white border border-dashed border-neutral-300 text-center py-2 px-3 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                                      <span>Code: <span className="font-black underline select-all text-neutral-955 text-neutral-955 text-neutral-955 text-neutral-950 bg-neutral-100 px-1 py-0.5">{v.code}</span></span>
                                      <button 
                                          onClick={() => {
                                              navigator.clipboard.writeText(v.code);
                                              window.dispatchEvent(new CustomEvent('toast', {
                                                  detail: { message: `Code "${v.code}" copied to clipboard!`, type: 'success' }
                                              }));
                                          }}
                                          className="text-[9px] font-black text-neutral-500 hover:text-black uppercase tracking-widest transition"
                                      >
                                          Copy
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

          </div>

      </div>
    </>
  );
}
