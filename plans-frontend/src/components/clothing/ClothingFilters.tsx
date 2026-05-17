import { FC, useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';

export interface ClothingFilterState {
  searchQuery: string;
  selectedType: string;
}

interface ClothingFiltersProps {
  typeOptions: { value: string; displayName: string }[];
  onChange: (filters: ClothingFilterState) => void;
}

const ClothingFilters: FC<ClothingFiltersProps> = ({ typeOptions, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    onChange({ searchQuery, selectedType });
  }, [searchQuery, selectedType, onChange]);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedType('');
  };

  return (
    <div className='bg-light p-3 rounded mb-4 shadow-sm border'>
      <Row className='g-3 align-items-center'>
        <Col xs={12} md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className='bi bi-search'></i>
            </InputGroup.Text>
            <Form.Control
              placeholder='Search clothing by name...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </InputGroup>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Form.Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
            }}
          >
            <option value=''>All Clothing Types</option>
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.displayName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} sm={4} md={2} className='text-md-end'>
          <Button
            variant='outline-secondary'
            onClick={handleClear}
            disabled={!searchQuery && !selectedType}
            className='w-100'
          >
            Clear
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ClothingFilters;
