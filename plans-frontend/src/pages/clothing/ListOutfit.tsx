import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchOutfits, RootState } from 'store';
import { useAppDispatch } from 'store/hooks';

const ListClothing: FC = () => {
  const dispatch = useAppDispatch();
  const outfitItems = useSelector((state: RootState) => state.clothing.outfit);

  useEffect(() => {
    dispatch(fetchOutfits());
  }, [dispatch]);

  // TODO: Finish Add Clothing button
  // TODO: Add "Add Outfit" button
  return (
    <div className='container'>
      <h1>Outfit List</h1>
      <button className='btn btn-success mt-3'>Add Clothing</button>
    </div>
  );
};
export default ListClothing;
