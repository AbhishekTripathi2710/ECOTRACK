import React from 'react';
import { useChallenges } from '../context/ChallengeContext';
import { useNotification } from '../context/NotificationContext';

const Challenge = ({ challenge }) => {
  const { markChallengeComplete } = useChallenges();
  const { addNotification } = useNotification();

  const handleComplete = async () => {
    try {
      await markChallengeComplete(challenge._id);
      addNotification(`Challenge completed: ${challenge.name}`, 'challenge');
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold">{challenge.name}</h3>
      <p className="text-gray-600">{challenge.description}</p>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${challenge.progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Progress: {challenge.progress}%
        </p>
      </div>
      {!challenge.completed && (
        <button
          onClick={handleComplete}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Mark as Complete
        </button>
      )}
      {challenge.completed && (
        <div className="mt-4 text-green-500 font-semibold">
          ✓ Completed
        </div>
      )}
    </div>
  );
};

export default Challenge; 