import { useEffect, type FC, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  WealthManagementStatus,
  type RootState,
  userActions,
  wealthManagementActions,
  WealthManagementObject
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';

const WealthManagement: FC = () => {
  const [wealthManagement, setWealthManagement] = useState<WealthManagementObject | undefined>(
    undefined
  );

  const dispatch = useAppDispatch();
  const {
    wealthManagement: reduxWealthManagement,
    status: wealthManagementStatus,
    wealthManagementChanged
  } = useSelector((state: RootState) => state.wealthManagement);
  const user = useSelector((state: RootState) => state.userInfo.user);

  useEffect(() => {
    if (user === null) {
      dispatch(userActions.fetchCurrentUser()).catch((err) => {
        console.log(err);
      });
    }

    if (user && user.wealthManagementID && wealthManagementStatus === WealthManagementStatus.IDLE) {
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        (err) => {
          console.log(err);
        }
      );
    }
  }, [user, wealthManagementStatus]);

  useEffect(() => {
    if (wealthManagementChanged) {
      dispatch(wealthManagementActions.setWealthManagementChanged(false));
      if (user && user.wealthManagementID) {
        dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
          (err) => {
            console.log(err);
          }
        );
      }
    }
  }, [wealthManagementChanged]);

  useEffect(() => {
    if (reduxWealthManagement) {
      setWealthManagement(reduxWealthManagement);
    }
  }, [reduxWealthManagement]);

  let content;

  if (wealthManagement) {
    content = (
      <>
        <h1 className='text-center'>Wealth Management</h1>
        <ExpandableTable wealthManagement={wealthManagement} />
      </>
    );
  } else {
    switch (wealthManagementStatus) {
      case WealthManagementStatus.LOADING:
        content = <div>Loading...</div>;
        break;
      case WealthManagementStatus.SUCCEEDED:
        content = <div>Failed to load wealth management data.</div>;
        break;
      case WealthManagementStatus.FAILED:
        content = <div>Failed to load wealth management data.</div>;
        break;
      default:
        content = <div>Unknown error.</div>;
    }
  }

  return <Container fluid>{content}</Container>;
};
export default WealthManagement;
