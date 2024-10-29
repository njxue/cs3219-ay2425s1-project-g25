// QuestionCard.tsx

import React from "react";
import { Card, Tag, Button, message } from "antd";
import { Question } from "../../domain/entities/Question";
import styles from "./QuestionCard.module.css";
import { getDifficultyColor } from "presentation/utils/QuestionUtils";

// TEMPORARY CODE START
import AuthClientStore from "data/auth/AuthClientStore";
// TEMPORARY CODE END

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onClick: () => void;
  isNarrow: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSelected,
  onClick,
  isNarrow,
}) => {
  // TEMPORARY CODE START
  const handleCreateAttempt = async () => {
    try {
      const token = AuthClientStore.getAccessToken();

      const response = await fetch("http://localhost:3002/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Passing token in header
        },
        body: JSON.stringify({
          question: question._id,
          attemptStartedAt: new Date(),
          attemptCompletedAt: new Date(),
          collaborator: "", // Leaving collaborator empty
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create attempt");
      }

      const data = await response.json();
      console.log(data);

      message.success("Attempt created successfully");
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Error creating attempt: ${error.message}`);
      } else {
        message.error("Unknown error occurred");
      }
    }
  };
  // TEMPORARY CODE END

  return (
    <Card
      className={`${styles.card} ${isSelected ? styles.selectedCard : ""} ${
        isNarrow ? styles.narrowCard : ""
      }`}
      hoverable
      onClick={onClick}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{question.title}</h2>
      </div>

      <div className={styles.footer}>
        <Tag
          color={getDifficultyColor(question.difficulty)}
          className={styles.difficultyTag}
        >
          {question.difficulty}
        </Tag>
        <div className={styles.categoriesContainer}>
          {question.categories.map((category) => (
            <Tag key={category._id} color="blue" className={styles.categoryTag}>
              {category.name}
            </Tag>
          ))}
        </div>
      </div>

      {/* TEMPORARY CODE START */}
      <div className={styles.createAttemptButton}>
        <Button type="primary" onClick={handleCreateAttempt}>
          Create Attempt
        </Button>
      </div>
      {/* TEMPORARY CODE END */}
    </Card>
  );
};
