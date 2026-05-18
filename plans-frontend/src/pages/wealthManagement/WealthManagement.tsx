import { type FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { type RootState, wealthManagementActions, WealthManagementModel, WealthManagementStatus } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';
import { useFetchCurrentUserQuery } from '../../store/api/userApi';

const WealthManagement: FC = () => {
  const [wealthManagement, setWealthManagement] = useState<WealthManagementModel | undefined>();

  const dispatch = useAppDispatch();
  const {
    wealthManagement: reduxWealthManagement,
    status: wealthManagementStatus,
    wealthManagementChanged,
  } = useSelector((state: RootState) => state.wealthManagement);
  const { data: user } = useFetchCurrentUserQuery();

  useEffect(() => {
    if (user?.wealthManagementID && wealthManagementStatus === WealthManagementStatus.IDLE) {
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        (error: unknown) => {
          console.log(error);
        },
      );
    }
  }, [user, wealthManagementStatus, dispatch]);

  useEffect(() => {
    if (wealthManagementChanged) {
      dispatch(wealthManagementActions.setWealthManagementChanged(false));
      if (user?.wealthManagementID) {
        dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
          (error: unknown) => {
            console.log(error);
          },
        );
      }
    }
  }, [wealthManagementChanged, user?.wealthManagementID, dispatch]);

  useEffect(() => {
    if (reduxWealthManagement) {
      setWealthManagement(reduxWealthManagement);
    }
  }, [reduxWealthManagement]);

  let content;

  if (wealthManagement) {
    content = (
      <>
        <h1 className="text-center">Wealth Management</h1>
        <ExpandableTable wealthManagement={wealthManagement} />
      </>
    );
  } else {
    switch (wealthManagementStatus) {
      case WealthManagementStatus.LOADING: {
        content = <div>Loading...</div>;
        break;
      }
      case WealthManagementStatus.SUCCEEDED: {
        content = <div>Failed to load wealth management data.</div>;
        break;
      }
      case WealthManagementStatus.FAILED: {
        content = <div>Failed to load wealth management data.</div>;
        break;
      }
      default: {
        content = <div>Unknown error.</div>;
      }
    }
  }

  return <Container fluid>{content}</Container>;
};
export default WealthManagement;
