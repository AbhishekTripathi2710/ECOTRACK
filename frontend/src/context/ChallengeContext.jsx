import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserChallenges, completeChallenge } from '../services/communityService';
import { useUser } from './UserContext';
import { useNotification } from './NotificationContext';

const ChallengeContext = createContext();

export const ChallengeProvider = ({ children }) => {
  const { user } = useUser();
  const { addNotification } = useNotification();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallenges = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const userChallenges = await getUserChallenges(user._id);
      setChallenges(userChallenges);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markChallengeComplete = async (challengeId) => {
    try {
      const result = await completeChallenge(user._id, challengeId);
      if (result.success) {
        // Update the challenge in the local state
        setChallenges(prevChallenges => 
          prevChallenges.map(challenge => 
            challenge.id === challengeId 
              ? { ...challenge, completed: true, progress: 100 }
              : challenge
          )
        );
        
        // Show notification
        const completedChallenge = challenges.find(c => c.id === challengeId);
        if (completedChallenge) {
          addNotification(`Challenge completed: ${completedChallenge.name}`, 'challenge');
        }
        
        // Refresh the challenges list
        await fetchChallenges();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user?._id]);

  return (
    <ChallengeContext.Provider value={{
      challenges,
      loading,
      error,
      fetchChallenges,
      markChallengeComplete
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
}; 