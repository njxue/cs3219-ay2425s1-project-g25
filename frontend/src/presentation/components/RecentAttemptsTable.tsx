import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Badge, Button, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from "./RecentAttemptsTable.module.css";
import { HistoryEntry } from "domain/entities/HistoryEntry";
import { historyUseCases } from "domain/usecases/HistoryUseCases";

export const RecentAttemptsTable: React.FC = () => {
  const [recentAttemptsData, setRecentAttemptsData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    fetchRecentAttempts();
  }, []);

  const fetchRecentAttempts = async () => {
    setLoading(true);
    try {
      const data = await historyUseCases.getAllCategories();
      setRecentAttemptsData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch recent attempts:", error.message);
        message.error(`Failed to fetch recent attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during data fetching");
        message.error("Unknown error occurred during data fetching");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllAttempts = async () => {
    try {
      await historyUseCases.deleteAllUserHistories();
      message.success("All attempts cleared successfully");
      setRecentAttemptsData([]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to clear attempts:", error.message);
        message.error(`Failed to clear attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during attempt clearing");
        message.error("Unknown error occurred during attempt clearing");
      }
    }
  };

  const handleDeleteSelectedAttempts = async () => {
    try {
      if (selectedRowKeys.length === 0) {
        message.info("No attempts selected");
        return;
      }
      await historyUseCases.deleteSelectedUserHistories(selectedRowKeys.map((key) => key.toString()));
      message.success(`${selectedRowKeys.length} attempt(s) deleted successfully`);
      setRecentAttemptsData((prevData) =>
        prevData.filter((attempt) => !selectedRowKeys.includes(attempt.key))
      );
      setSelectedRowKeys([]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to delete attempts:", error.message);
        message.error(`Failed to delete attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during attempt deletion");
        message.error("Unknown error occurred during attempt deletion");
      }
    }
  };

  const columns: ColumnsType<HistoryEntry> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.attemptCompletedAt).getTime() - new Date(b.attemptCompletedAt).getTime(),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      filters: [
        { text: 'Easy', value: 'Easy' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Hard', value: 'Hard' },
      ],
      onFilter: (value, record) => record.difficulty === value,
      render: (difficulty: 'Easy' | 'Medium' | 'Hard') => {
        const color = difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'orange' : 'red';
        return (
          <Badge
            color={color}
            text={difficulty}
          />
        );
      },
    },
    {
      title: 'Topics',
      dataIndex: 'topics',
      key: 'topics',
      render: (topics: string[]) => (
        <>
          {topics.map((topic, index) => (
            <Tag key={index} color="black" style={{ color: 'white' }}>
              {topic}
            </Tag>
          ))}
        </>
      ),
    },
  ];

  // Row Selection Configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.header}>Recent Attempts</h3>
        <div className={styles.actions}>
          <Button type="link" onClick={fetchRecentAttempts}>
            Refresh
          </Button>
          <Button type="link" onClick={handleDeleteSelectedAttempts} disabled={selectedRowKeys.length === 0}>
            Delete Selected
          </Button>
          <Button type="link" onClick={handleClearAllAttempts} disabled={recentAttemptsData.length === 0}>
            Clear All
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={recentAttemptsData}
        loading={loading}
        rowSelection={rowSelection}
        locale={{
          emptyText: <Empty description="No attempts yet" />,
        }}
      />
    </div>
  );
};
