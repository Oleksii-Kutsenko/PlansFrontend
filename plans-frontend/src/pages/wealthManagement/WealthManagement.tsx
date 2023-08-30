import { useEffect, type FC } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { useSelector } from 'react-redux';
import { WealthManagementStatus, type RootState } from '../../store';
import { fetchWealthManagement } from '../../store';
import { ExpandableTable } from './ExpandableTable';
import { Container } from 'react-bootstrap';

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
            <h1 className="text-center">Wealth Management</h1>
            <ExpandableTable data={wealthManagement.allocations} />
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
