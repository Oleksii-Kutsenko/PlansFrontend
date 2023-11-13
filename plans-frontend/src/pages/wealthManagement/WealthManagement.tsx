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
  const dispatch = useAppDispatch();
  const [wealthManagement, setWealthManagement] = useState<WealthManagementObject | undefined>(
    undefined
  );

  const { wealthManagement: reduxWealthManagement, status: wealthManagementStatus } = useSelector(
    (state: RootState) => state.wealthManagement
  );
  const user = useSelector((state: RootState) => state.userInfo.user);

  useEffect(() => {
    if (user === null) {
      dispatch(userActions.fetchCurrentUser()).catch((err) => {
        console.log(err);
      });
    }

    if (
      user &&
      user.wealthManagementID &&
      (wealthManagementStatus === WealthManagementStatus.IDLE || wealthManagement === undefined)
    ) {
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        (err) => {
          console.log(err);
        }
      );
    }
  }, [user, wealthManagementStatus]);
  // TODO: Update asset allocation with patch wealth management endpoint, and re-set wealth management state
  useEffect(() => {
    console.log('reduxWealthManagement');
    if (reduxWealthManagement) {
      setWealthManagement(reduxWealthManagement);
    }
  }, [reduxWealthManagement]);

  let content;

  switch (wealthManagementStatus) {
    case WealthManagementStatus.LOADING:
      content = <div>Loading...</div>;
      break;
    case WealthManagementStatus.SUCCEEDED:
      if (wealthManagement != null) {
        content = (
          <>
            <h1 className='text-center'>Wealth Management</h1>
            <ExpandableTable wealthManagement={wealthManagement} />
          </>
        );
      } else {
        content = <div>Failed to load wealth management data.</div>;
      }
      break;
    case WealthManagementStatus.FAILED:
      content = <div>Failed to load wealth management data.</div>;
      break;
    default:
      content = <div>Unknown error.</div>;
  }

  return <Container fluid>{content}</Container>;
};
export default WealthManagement;
