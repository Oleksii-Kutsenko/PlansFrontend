import { useEffect, type FC } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { WealthManagementStatus, fetchWealthManagement, type RootState } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';

const WealthManagement: FC = () => {
  const dispatch = useAppDispatch();

  const { wealthManagement, status: wealthManagementStatus } = useSelector(
    (state: RootState) => state.wealthManagement
  );

  useEffect(() => {
    dispatch(fetchWealthManagement()).catch((err) => {
      console.log(err);
    });
  }, []);

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
