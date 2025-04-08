/**
 * This script generates badge images for the achievements system if they don't exist.
 * Run this script with: node create-badges.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Define the badges directory
const badgesDir = path.join(__dirname, '..', 'public', 'badges');

// Create badges directory if it doesn't exist
if (!fs.existsSync(badgesDir)) {
  console.log('Creating badges directory...');
  fs.mkdirSync(badgesDir, { recursive: true });
}

// Define badge configurations
const badges = [
  { name: 'beginner', color: '#4CAF50', icon: '🌱' },
  { name: 'explorer', color: '#42A5F5', icon: '🧭' },
  { name: 'master', color: '#7E57C2', icon: '🏆' },
  { name: 'challenger', color: '#FFA726', icon: '🏅' },
  { name: 'champion', color: '#26A69A', icon: '🌟' },
  { name: 'leader', color: '#EC407A', icon: '👑' },
  { name: 'reducer', color: '#66BB6A', icon: '📉' },
  { name: 'warrior', color: '#5C6BC0', icon: '⚔️' },
  { name: 'guardian', color: '#26C6DA', icon: '🛡️' },
  { name: 'consistent', color: '#78909C', icon: '📆' },
  { name: 'committed', color: '#AB47BC', icon: '🔄' },
  { name: 'expert', color: '#EF5350', icon: '🎓' },
  { name: 'helper', color: '#9CCC65', icon: '🤝' },
  { name: 'mentor', color: '#FF7043', icon: '🧠' },
  { name: 'fighter', color: '#8D6E63', icon: '🌍' }
];

// Create each badge
badges.forEach(badge => {
  const badgePath = path.join(badgesDir, `${badge.name}.png`);
  
  // Skip if badge already exists
  if (fs.existsSync(badgePath)) {
    console.log(`Badge ${badge.name} already exists, skipping...`);
    return;
  }
  
  console.log(`Creating badge: ${badge.name}`);
  
  // Create a circular badge with the icon
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Draw background circle
  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, Math.PI * 2);
  ctx.fillStyle = badge.color;
  ctx.fill();
  
  // Draw border
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  
  // Draw icon
  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(badge.icon, 100, 100);
  
  // Save the badge
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(badgePath, buffer);
});

console.log('All badges created successfully!'); 