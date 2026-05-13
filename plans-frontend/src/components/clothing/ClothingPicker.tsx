import { FC, useState, useMemo } from 'react';
import { Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { Clothing } from '../store/slices/clothing';
import ClothingCard from './ClothingCard';
interface ClothingPickerProps {
  allItems: Clothing[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  typeOptions?: { value: string; displayName: string }[];
}
const ClothingPicker: FC<ClothingPickerProps> = ({
  allItems,
  selectedIds,
  onSelectionChange,
  typeOptions = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType ? item.clothingType === selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [allItems, searchQuery, selectedType]);
  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  return (
    <div className='clothing-picker'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div className='d-flex gap-2 flex-grow-1 me-3'>
          <InputGroup style={{ maxWidth: '300px' }}>
            <InputGroup.Text>
              <i className='bi bi-search'></i>
            </InputGroup.Text>
            <Form.Control
              placeholder='Search clothing...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Form.Select
            style={{ maxWidth: '200px' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value=''>All Types</option>
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.displayName}
              </option>
            ))}
          </Form.Select>
        </div>
        <div>
          <Badge bg={selectedIds.length > 0 ? 'primary' : 'secondary'} className='fs-6'>
            {selectedIds.length} Selected
          </Badge>
        </div>
      </div>
      <div className='bg-light p-3 rounded border overflow-auto' style={{ maxHeight: '500px' }}>
        {filteredItems.length === 0 ? (
          <p className='text-center text-muted my-5'>No clothing items match your filters.</p>
        ) : (
          <Row xs={2} md={3} lg={4} className='g-3'>
            {filteredItems.map((item) => (
              <Col key={item.id}>
                <ClothingCard
                  item={item}
                  selectable={true}
                  selected={selectedIds.includes(item.id)}
                  onToggle={handleToggle}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};
export default ClothingPicker;
