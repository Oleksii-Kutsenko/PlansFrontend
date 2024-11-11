import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchClothing, deleteClothing, RootState } from '../../store';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router-dom';

const ClothingList: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const clothingItems = useSelector((state: RootState) => state.clothing.clothings);

  useEffect(() => {
    dispatch(fetchClothing());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteClothing(id));
    }
  };

  const navigateToAddClothing = () => {
    navigate('/clothing/create');
  };

  return (
    <div className='container'>
      <h1>Clothing List</h1>

      <table className='clothing-table'>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clothingItems.map((item) => (
            <tr key={item.id}>
              <td className='image-cell'>
                <img
                  src={`http://localhost:8000/${item.image_path}`}
                  alt='Clothing'
                  className='clothing-image'
                />
              </td>
              <td>{item.name}</td>
              <td>{item.clothingType}</td>
              <td>
                <button
                  onClick={() => navigate(`/clothing/edit/${item.id}`)}
                  className='btn btn-primary m-1'
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className='btn btn-danger'>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={navigateToAddClothing} className='btn btn-success mt-3'>
        Add Clothing
      </button>
    </div>
  );
};

export default ClothingList;
