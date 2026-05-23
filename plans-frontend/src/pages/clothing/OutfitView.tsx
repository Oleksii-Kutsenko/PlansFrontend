import { FC } from 'react';
import { Badge, Col, Row } from 'react-bootstrap';

import { Outfit } from '@/store/api/clothingApi';

import ClothingCard from '../../components/clothing/ClothingCard';

interface OutfitViewProps {
  outfit: Outfit;
}

const OutfitView: FC<OutfitViewProps> = ({ outfit }) => {
  return (
    <>
      <div className="bg-light rounded border p-4 mb-4 d-flex flex-column flex-md-row gap-4 align-items-center">
        {outfit.previewImage ? (
          <img
            src={outfit.previewImage}
            alt={outfit.outfitName}
            style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '8px' }}
            className="shadow-sm border"
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-white border shadow-sm text-muted"
            style={{ width: '250px', height: '250px', borderRadius: '8px' }}
          >
            <div className="text-center">
              <i className="bi bi-image fs-1 d-block mb-2"></i>
              <span>No Preview Image</span>
            </div>
          </div>
        )}

        <div className="flex-grow-1 text-center text-md-start">
          <h1 className="fw-bold mb-3">{outfit.outfitName}</h1>
          <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-3">
            {outfit.occasionName && (
              <Badge bg="info" className="fs-6 text-dark py-2 px-3">
                <i className="bi bi-calendar-event me-2"></i>
                {outfit.occasionName}
              </Badge>
            )}
            {outfit.season && (
              <Badge bg="secondary" className="fs-6 py-2 px-3">
                <i className="bi bi-cloud-sun me-2"></i>
                {outfit.season}
              </Badge>
            )}
          </div>
          <p className="text-muted">
            <strong>{Array.isArray(outfit.clothings) ? outfit.clothings.length : 0}</strong>{' '}
            clothing items in this outfit.
          </p>
        </div>
      </div>

      <h3 className="mb-4 mt-5 border-bottom pb-2">Clothing Items</h3>
      {Array.isArray(outfit.clothings) && outfit.clothings.length > 0 ? (
        <Row xs={2} md={3} lg={4} className="g-4">
          {outfit.clothings.map((clothing) => {
            return (
              <Col key={clothing.id}>
                <ClothingCard item={clothing} />
              </Col>
            );
          })}
        </Row>
      ) : (
        <p className="text-muted fst-italic">This outfit has no clothing items yet.</p>
      )}
    </>
  );
};

export default OutfitView;
