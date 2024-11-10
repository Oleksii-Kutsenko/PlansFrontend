import { useEffect, type FC, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  WealthManagementStatus,
  type RootState,
  userActions,
  wealthManagementActions,
  WealthManagementModel,
  AcquisitionType
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { ExpandableTable } from './ExpandableTable';

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
    if (!user) {
      dispatch(userActions.fetchCurrentUser()).catch(console.error);
    } else if (user.wealthManagementID && wealthManagementStatus === WealthManagementStatus.IDLE) {
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        console.error
      );
    }
  }, [user, wealthManagementStatus, dispatch]);

  useEffect(() => {
    if (wealthManagementChanged && user?.wealthManagementID) {
      dispatch(wealthManagementActions.setWealthManagementChanged(false));
      dispatch(wealthManagementActions.fetchWealthManagement(user.wealthManagementID)).catch(
        console.error
      );
    }
  }, [wealthManagementChanged, user, dispatch]);

  useEffect(() => {
    setWealthManagement(reduxWealthManagement);
  }, [reduxWealthManagement]);

  const filterAllocations = (acquisitionType: AcquisitionType) =>
    wealthManagement?.allocations
      .map((allocation) => ({
        ...allocation,
        asset_allocations: allocation.asset_allocations.filter(
          (asset) => asset.acquisitionType === acquisitionType
        )
      }))
      .filter((allocation) => allocation.asset_allocations.length > 0);

  const allocationLimitedPurchase = filterAllocations(AcquisitionType.LIMITED_PURCHASE);
  const allocationContinuousPurchase = filterAllocations(AcquisitionType.CONTINUOUS_PURCHASE);
  const wealthManagementLimitedPurchase = {
    ...wealthManagement,
    allocations: allocationLimitedPurchase
  };
  const wealthManagementContinuousPurchase = {
    ...wealthManagement,
    allocations: allocationContinuousPurchase
  };
  console.debug(wealthManagementLimitedPurchase);
  console.debug(wealthManagementContinuousPurchase);

  const renderContent = () => {
    if (!wealthManagement) {
      return (
        {
          [WealthManagementStatus.LOADING]: <div>Loading...</div>,
          [WealthManagementStatus.FAILED]: <div>Failed to load wealth management data.</div>
        }[status] || <div>Unknown error.</div>
      );
    }

    return (
      <>
        <header>
          <h1 className='text-right'>Wealth Management Dashboard</h1>
        </header>
        <section>
          <h2>Limited Purchase</h2>
          <ExpandableTable wealthManagement={wealthManagementLimitedPurchase} />
        </section>
        <section>
          <h2>Continuous Purchase</h2>
          <ExpandableTable wealthManagement={wealthManagementContinuousPurchase} />
        </section>
      </>
    );
  };

  return (
    <Container fluid>
      <main>{renderContent()}</main>
    </Container>
  );
};
export default WealthManagement;
