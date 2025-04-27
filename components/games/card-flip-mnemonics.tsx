import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Button } from '@/components/ui/button';
import { Target, Star, Timer } from 'lucide-react-native';
import Animated, { FadeIn, withSequence, withTiming } from 'react-native-reanimated';

export default function CardFlipMnemonicsGame() {
  const [phase, setPhase] = useState('playing');
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [brainBoost, setBrainBoost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [cardRotations, setCardRotations] = useState([]);
  const [cards, setCards] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');

  const handleCardPress = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].matchId)
    ) {
      return;
    }

    if (Platform.OS !== 'web') {
      cardRotations[index].value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
    } else {
      // For web, just update the value directly
      cardRotations[index].value = 1;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.matchId === secondCard.matchId) {
        // Correct match
        setTimeout(() => {
          const newMatchedPairs = [...matchedPairs, firstCard.matchId];
          setMatchedPairs(newMatchedPairs);
          setFlippedIndices([]);
          setCombo((prev) => prev + 1);
          const points = brainBoost ? 20 : 10;
          setScore((prev) => prev + points + (combo * 5));
          
          if (combo === 4) {
            setBrainBoost(true);
            setTimeout(() => setBrainBoost(false), 30000);
          }

          // Check if all pairs are matched
          const totalPairs = LEVELS[difficulty].pairs;
          if (newMatchedPairs.length === totalPairs) {
            // Add time bonus
            const timeBonus = Math.floor(timeLeft * 0.5); // 0.5 points per second left
            setScore((prev) => prev + timeBonus);
            setPhase('end');
          }
        }, 500);
      } else {
        // Wrong match
        setTimeout(() => {
          setFlippedIndices([]);
          setCombo(0);
          if (Platform.OS === 'web') {
            cardRotations[firstIndex].value = 0;
            cardRotations[secondIndex].value = 0;
          }
        }, 1000);
      }
    }
  };

  const handleStart = (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
    setPhase('playing');
    // Add other reset logic here
  };

  return (
    <View style={styles.container}>
      {phase === 'end' && (
        <Animated.View 
          entering={FadeIn}
          style={styles.gameOverContainer}
        >
          <Text style={styles.gameOverTitle}>
            {timeLeft > 0 ? 'Congratulations!' : 'Time\'s Up!'}
          </Text>
          <View style={styles.resultsContainer}>
            <View style={styles.resultItem}>
              <Target size={32} color="#ffffff" />
              <Text style={styles.resultLabel}>Final Score</Text>
              <Text style={styles.resultValue}>{score}</Text>
            </View>
            <View style={styles.resultItem}>
              <Star size={32} color="#ffffff" />
              <Text style={styles.resultLabel}>Best Combo</Text>
              <Text style={styles.resultValue}>{combo}</Text>
            </View>
            {timeLeft > 0 && (
              <View style={styles.resultItem}>
                <Timer size={32} color="#ffffff" />
                <Text style={styles.resultLabel}>Time Bonus</Text>
                <Text style={styles.resultValue}>+{Math.floor(timeLeft * 0.5)}</Text>
              </View>
            )}
          </View>
          <Button onPress={() => handleStart(difficulty)} style={styles.restartButton}>
            Play Again
          </Button>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  resultsContainer: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'column',
    gap: 20,
    marginBottom: 40,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  resultLabel: {
    flex: 1,
    fontSize: 18,
    color: '#ffffff',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
});

export { CardFlipMnemonicsGame }