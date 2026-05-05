import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clothingActions } from '../../store/slices/clothing';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table, Button } from 'react-bootstrap';

const ClothingList: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const clothingItems = useSelector((state: RootState) => state.clothing.clothing);

  useEffect(() => {
    void dispatch(clothingActions.fetchClothing());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      dispatch(clothingActions.deleteClothing(id))
        .unwrap()
        .then(() => {
          toast.success('Clothing deleted successfully');
        })
        .catch((error) => {
          console.error('Failed to delete clothing:', error);
          toast.error('Failed to delete clothing');
        });
    }
  };

  const navigateToAddClothing = () => {
    void navigate('/clothing/create');
  };

  return (
    <div className='container mt-5 mb-5'>
      <h2 className='mb-4'>Clothing Items</h2>
      {clothingItems.length === 0 ? (
        <p className='text-muted'>No clothing items found. Add some!</p>
      ) : (
        <Table striped bordered hover responsive className='align-middle'>
          <thead className='table-light'>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clothingItems.map((item, index) => (
              <tr key={`clothing-row-${item.id}-${index}`}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.clothing_type}</td>
                <td>
                  <div className='d-flex gap-2 justify-content-center'>
                    {/* Edit is hidden until Edit component exists */}
                    {/*
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={() => {
                        void navigate(`/clothing/edit/${item.id}`);
                      }}
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
      <div className='mt-4'>
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

export default ClothingList;
