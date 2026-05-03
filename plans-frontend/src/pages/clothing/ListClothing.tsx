import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';

const ClothingList: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const clothingItems = useSelector((state: RootState) => state.clothing.clothing);

  useEffect(() => {
    void dispatch(clothingActions.fetchClothing());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      void dispatch(clothingActions.deleteClothing(id));
    }
  };

  const navigateToAddClothing = () => {
    navigate('/clothing/add');
  };

  return (
    <div className='container mt-5'>
      <h2>Clothing Items</h2>
      {clothingItems.length === 0 && <p>No clothing items found. Add some!</p>}
      <table className='table table-striped table-bordered table-hover mt-3'>
        <thead className='thead-dark'>
          <tr>
            <th scope='col'>ID</th>
            <th scope='col'>Name</th>
            <th scope='col'>Type</th>
            <th scope='col'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clothingItems.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.clothing_type}</td>
              <td>
                <button
                  onClick={() => {
                    void navigate(`/clothing/edit/${item.id}`);
                  }}
                  className='btn btn-primary m-1'
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    void handleDelete(item.id);
                  }}
                  className='btn btn-danger'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          void navigateToAddClothing();
        }}
        className='btn btn-success mt-3'
      >
        Add Clothing
      </button>
    </div>
  );
};

export default ClothingList;
