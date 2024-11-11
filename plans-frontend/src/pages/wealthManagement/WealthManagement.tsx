import { useEffect, type FC, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  type RootState,
  userActions,
  wealthManagementActions,
  WealthManagementModel
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';
import { LoadingStatus } from 'store/slices/utils';

const WealthManagement: FC = () => {
  const [wealthManagement, setWealthManagement] = useState<WealthManagementModel | undefined>(
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

    if (user && user.wealthManagementID && wealthManagementStatus === LoadingStatus.IDLE) {
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
      case LoadingStatus.LOADING:
        content = <div>Loading...</div>;
        break;
      case LoadingStatus.SUCCEEDED:
        content = <div>Failed to load wealth management data.</div>;
        break;
      case LoadingStatus.FAILED:
        content = <div>Failed to load wealth management data.</div>;
        break;
      default:
        content = <div>Unknown error.</div>;
    }
  }

  return <Container fluid>{content}</Container>;
};
export default WealthManagement;
