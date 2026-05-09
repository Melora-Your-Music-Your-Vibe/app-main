import { useState } from 'react';
import { Gift, Lock, Sparkles, Trophy } from 'lucide-react';
import './Rewards.css';

const REWARDS_CATALOG = [
  { id: 1, title: 'Ad-Free Week', cost: 100, icon: <Sparkles size={24} />, desc: 'Enjoy 7 days of uninterrupted music streaming.' },
  { id: 2, title: 'Exclusive Theme', cost: 250, icon: <Trophy size={24} />, desc: 'Unlock a special gold & diamond app theme.' },
  { id: 3, title: 'Creator Badge', cost: 500, icon: <Gift size={24} />, desc: 'Get a verified Creator Badge on your profile.' },
];

export default function Rewards() {
  const [vicksBalance, setVicksBalance] = useState(150); // Mock balance

  const redeemReward = (cost) => {
    if (vicksBalance >= cost) {
      setVicksBalance(prev => prev - cost);
      alert('Reward redeemed successfully! 🎉');
    } else {
      alert('Not enough VICK\'S! Complete your profile to earn more. 🪙');
    }
  };

  return (
    <div className="rewards-page animate-fadeIn">
      <div className="rewards-header glass-card">
        <h1 className="page-title">Rewards Center 🎁</h1>
        <p className="page-subtitle">Redeem your earned VICK'S for exclusive perks.</p>

        <div className="balance-showcase glass-notification mt-2">
          <div className="vicks-coin-large">
            <span className="vicks-logo">V</span>
          </div>
          <div>
            <p className="balance-label">Current Balance</p>
            <h2 className="balance-amount gradient-text">{vicksBalance} VICK'S</h2>
          </div>
        </div>
      </div>

      <h3 className="section-title mt-4">Available Rewards</h3>
      <div className="rewards-grid">
        {REWARDS_CATALOG.map(reward => (
          <div key={reward.id} className="reward-card glass-card">
            <div className="reward-icon-wrap">
              {reward.icon}
            </div>
            <h4 className="reward-title">{reward.title}</h4>
            <p className="reward-desc">{reward.desc}</p>
            
            <div className="reward-action">
              <span className="reward-cost">
                <span className="vicks-logo-small">V</span> {reward.cost}
              </span>
              <button 
                className={`btn btn-sm ${vicksBalance >= reward.cost ? 'btn-primary' : 'btn-secondary'} glass-button`}
                onClick={() => redeemReward(reward.cost)}
                disabled={vicksBalance < reward.cost}
              >
                {vicksBalance >= reward.cost ? 'Redeem' : <><Lock size={14} /> Locked</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
