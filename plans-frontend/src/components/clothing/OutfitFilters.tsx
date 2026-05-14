import { FC, useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { Occasion } from '../../store/slices/clothing';

export interface FilterState {
  searchQuery: string;
  selectedOccasion: string;
  selectedSeason: string;
}

interface OutfitFiltersProps {
  occasions: Occasion[];
  seasonChoices: { value: string; displayName: string }[];
  onChange: (filters: FilterState) => void;
}

const OutfitFilters: FC<OutfitFiltersProps> = ({ occasions, seasonChoices, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');

  useEffect(() => {
    onChange({ searchQuery, selectedOccasion, selectedSeason });
  }, [searchQuery, selectedOccasion, selectedSeason, onChange]);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedOccasion('');
    setSelectedSeason('');
  };

  return (
    <div className='bg-light p-3 rounded mb-4 shadow-sm border'>
      <Row className='g-3 align-items-center'>
        <Col xs={12} md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className='bi bi-search'></i>
            </InputGroup.Text>
            <Form.Control
              placeholder='Search outfits...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Form.Select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
          >
            <option value=''>All Occasions</option>
            {occasions.map((occ) => (
              <option key={occ.id} value={occ.id}>
                {occ.occasionName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Form.Select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
            <option value=''>All Seasons</option>
            {seasonChoices.map((season) => (
              <option key={season.value} value={season.value}>
                {season.displayName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs={12} md={2} className='text-md-end'>
          <Button
            variant='outline-secondary'
            onClick={handleClear}
            disabled={!searchQuery && !selectedOccasion && !selectedSeason}
            className='w-100'
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default OutfitFilters;
