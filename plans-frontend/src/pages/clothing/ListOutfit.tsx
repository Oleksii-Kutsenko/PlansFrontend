import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button } from 'react-bootstrap';

const ListOutfit: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const outfitItems = useSelector((state: RootState) => state.clothing.outfit);

  useEffect(() => {
    void dispatch(clothingActions.fetchOutfits());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      dispatch(clothingActions.deleteOutfit(id))
        .unwrap()
        .then(() => {
          toast.success('Outfit deleted successfully');
        })
        .catch((error) => {
          console.error('Failed to delete outfit:', error);
          toast.error('Failed to delete outfit');
        });
    }
  };

  /*
  const navigateToAddOutfit = () => {
    void navigate('/clothing/outfits/create');
  };
  */

  const navigateToAddClothing = () => {
    void navigate('/clothing/create');
  };

  return (
    <div className='container mt-5 mb-5'>
      <h2 className='mb-4'>Outfits</h2>

      {outfitItems.length === 0 ? (
        <p className='text-muted'>No outfits found. Create some!</p>
      ) : (
        <Table striped bordered hover responsive className='align-middle'>
          <thead className='table-light'>
            <tr>
              <th>ID</th>
              <th>Outfit Name</th>
              <th>Clothing Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outfitItems.map((item, outfitIndex) => (
              <tr key={`outfit-row-${item.id}-${outfitIndex}`}>
                <td>{item.id}</td>
                <td>{item.outfit_name}</td>
                <td>
                  <ul className='mb-0 text-start'>
                    {item.clothings?.map((clothing, index) => {
                      const clothingId = typeof clothing === 'number' ? clothing : clothing.id;
                      const display =
                        typeof clothing === 'number' ? `Clothing ID: ${clothing}` : clothing.name;
                      // Use a combination of outfit id, clothing id, and index to ensure uniqueness
                      // since an outfit might theoretically contain the same clothing item twice
                      const uniqueKey = `outfit-${item.id}-clothing-${clothingId}-${index}`;
                      return <li key={uniqueKey}>{display}</li>;
                    })}
                  </ul>
                </td>
                <td>
                  <div className='d-flex gap-2 justify-content-center'>
                    {/* Edit is hidden until Edit component exists */}
                    {/*
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={() => {
                        void navigate(`/outfits/edit/${item.id}`);
                      }}
                      aria-label={`Edit outfit ${item.outfit_name}`}
                    >
                      Edit
                    </Button>
                    */}
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => {
                        void handleDelete(item.id);
                      }}
                      aria-label={`Delete outfit ${item.outfit_name}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className='mt-4 d-flex gap-3'>
        {/* Add Outfit is hidden until component exists */}
        {/*
        <Button
          variant='primary'
          onClick={() => {
            void navigateToAddOutfit();
          }}
        >
          Add Outfit
        </Button>
        */}
        <Button
          variant='success'
          onClick={() => {
            void navigateToAddClothing();
          }}
        >
          Add Clothing
        </Button>
      </div>
    </div>
  );
};

export default ListOutfit;
