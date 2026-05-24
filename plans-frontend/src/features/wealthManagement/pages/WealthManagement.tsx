import { skipToken } from '@reduxjs/toolkit/query';
import { type FC } from 'react';
import { Container } from 'react-bootstrap';

import { useFetchCurrentUserQuery } from '@/features/profile/api/userApi';

import { useFetchWealthManagementQuery } from '../api/wealthManagementApi';
import { ExpandableTable } from '../components/ExpandableTable';

const WealthManagement: FC = () => {
  const { data: user, isLoading: isUserLoading } = useFetchCurrentUserQuery();

  const {
    data: wealthManagement,
    isLoading: isWealthLoading,
    isError,
  } = useFetchWealthManagementQuery(user?.wealthManagementID ?? skipToken);

  if (isUserLoading || isWealthLoading) {
    return (
      <Container fluid>
        <div>Loading...</div>
      </Container>
    );
  }

  if (isError || !wealthManagement) {
    return (
      <Container fluid>
        <div>Failed to load wealth management data.</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1 className="text-center">Wealth Management</h1>
      <ExpandableTable wealthManagement={wealthManagement} />
    </Container>
  );
};

export default WealthManagement;
