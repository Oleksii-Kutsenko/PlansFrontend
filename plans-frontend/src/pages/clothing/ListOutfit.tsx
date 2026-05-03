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
    void dispatch(clothingActions.fetchOutfits());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      void dispatch(clothingActions.deleteOutfit(id));
    }
  };

  const navigateToAddOutfit = () => {
    void navigate('/outfits/add');
  };

  const navigateToAddClothing = () => {
    void navigate('/clothing/add');
  };

  return (
    <div className='container mt-5'>
      <h2>Outfits</h2>

      {outfitItems.length === 0 ? (
        <p>No outfits found. Create some!</p>
      ) : (
        <table className='table table-striped table-bordered table-hover mt-3'>
          <thead className='thead-dark'>
            <tr>
              <th scope='col'>ID</th>
              <th scope='col'>Outfit Name</th>
              <th scope='col'>Clothing Items</th>
              <th scope='col'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outfitItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.outfit_name}</td>
                <td>
                  <ul>
                    {item.clothings?.map((clothingId: number) => (
                      <li key={clothingId}>Clothing ID: {clothingId}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    onClick={() => {
                      void navigate(`/outfits/edit/${item.id}`);
                    }}
                    className='btn btn-primary m-1'
                    aria-label={`Edit outfit ${item.outfit_name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      void handleDelete(item.id);
                    }}
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
        <button
          onClick={() => {
            void navigateToAddOutfit();
          }}
          className='btn btn-primary'
        >
          Add Outfit
        </button>
        <button
          onClick={() => {
            void navigateToAddClothing();
          }}
          className='btn btn-success'
        >
          Add Clothing
        </button>
      </div>
    </div>
  );
};

export default ListOutfit;
