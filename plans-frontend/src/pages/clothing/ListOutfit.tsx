import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';

const ListOutfit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const outfitItems = useSelector((state: RootState) => state.clothing.outfit);

  useEffect(() => {
    dispatch(clothingActions.fetchOutfits());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      dispatch(clothingActions.deleteOutfit(id));
    }
  };

  const navigateToAddClothing = () => {
    navigate('/clothing/create');
  };

  const navigateToAddOutfit = () => {
    navigate('/clothing/outfit/create'); // Assuming this route will exist
  };

  return (
    <div className='container'>
      <h1>Outfit List</h1>

      {outfitItems.length === 0 ? (
        <div className='text-center p-5 border rounded bg-light my-4'>
          <i className='bi bi-inbox text-secondary' style={{ fontSize: '3rem' }}></i>
          <h3 className='mt-3 text-secondary'>No outfits found</h3>
          <p className='text-muted'>You have not created any outfits yet.</p>
        </div>
      ) : (
        <table className='clothing-table table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Outfit Name</th>
              <th>Occasion ID</th>
              <th>Items Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outfitItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.outfit_name}</td>
                <td>{item.occasion}</td>
                <td>{item.clothings?.length || 0}</td>
                <td>
                  <button
                    onClick={() => navigate(`/clothing/outfit/edit/${item.id}`)}
                    className='btn btn-primary m-1'
                    aria-label={`Edit outfit ${item.outfit_name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className='btn btn-danger m-1'
                    aria-label={`Delete outfit ${item.outfit_name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className='mt-3 d-flex gap-2'>
        <button onClick={navigateToAddOutfit} className='btn btn-primary'>
          Add Outfit
        </button>
        <button onClick={navigateToAddClothing} className='btn btn-success'>
          Add Clothing
        </button>
      </div>
    </div>
  );
};

export default ListOutfit;
