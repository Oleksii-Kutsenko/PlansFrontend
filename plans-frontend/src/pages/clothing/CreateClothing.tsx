import { useState } from 'react';
import { ClothingCreate, createClothing } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';

const CreateClothing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState<ClothingCreate>({
    name: '',
    clothingType: '',
    season: '',
    image: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(createClothing(form)).unwrap();
      alert('Clothing item added!');
      navigate('/clothing');
    } catch (error) {
      alert('Error adding clothing item.');
      console.error(error);
    }
  };

  return (
    <div className='container'>
      <h1>Create Clothing</h1>
      <form onSubmit={handleSubmit} encType='multipart/form-data'>
        <div className='mb-3'>
          <label className='form-label'>Name:</label>
          <input
            name='name'
            value={form.name}
            onChange={handleChange}
            className='form-control'
            type='text'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Type:</label>
          <input
            name='type'
            value={form.clothingType}
            onChange={handleChange}
            className='form-control'
            type='text'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Season:</label>
          <input
            name='season'
            value={form.season}
            onChange={handleChange}
            className='form-control'
            type='text'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Upload Image:</label>
          <input
            onChange={handleFileChange}
            className='form-control'
            type='file'
            accept='image/*'
          />
        </div>
        <button className='btn btn-success' type='submit'>
          Save Clothing
        </button>
      </form>
    </div>
  );
};

export default CreateClothing;
