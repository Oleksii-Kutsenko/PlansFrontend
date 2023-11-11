import { useEffect, type FC } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  WealthManagementStatus,
  type RootState,
  userActions,
  wealthManagementActions
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';

const WealthManagement: FC = () => {
  const dispatch = useAppDispatch();

  const {
    wealthManagement,
    wealthManagementChanged,
    status: wealthManagementStatus
  } = useSelector((state: RootState) => state.wealthManagement);
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
      (wealthManagementStatus === WealthManagementStatus.IDLE || wealthManagementChanged)
    ) {
      dispatch(wealthManagementActions.setWealthManagementChanged(false));
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        (err) => {
          console.log(err);
        }
      );
    }
    console.log('wealthManagementChanged');
  }, [user, wealthManagementChanged, wealthManagementStatus]);

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
