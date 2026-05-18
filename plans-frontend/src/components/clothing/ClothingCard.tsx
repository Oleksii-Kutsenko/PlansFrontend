import { FC } from 'react';
import { Badge, Button, Card, Form } from 'react-bootstrap';

import { Clothing } from '../../store/slices/clothing';

interface ClothingCardProps {
  item: Clothing;
  selected?: boolean;
  selectable?: boolean;
  removable?: boolean;
  onToggle?: (id: number) => void;
  onRemove?: (id: number) => void;
}

const ClothingCard: FC<ClothingCardProps> = ({
  item,
  selected = false,
  selectable = false,
  removable = false,
  onToggle,
  onRemove,
}) => {
  return (
    <Card
      className={`h-100 ${selectable ? 'cursor-pointer' : ''} ${selected ? 'border-primary' : ''}`}
      onClick={() => selectable && onToggle?.(item.id)}
      style={{ cursor: selectable ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
    >
      {selectable && (
        <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 1 }}>
          <Form.Check
            type="checkbox"
            checked={selected}
            onClick={(e) => {
              e.stopPropagation();
            }} // Prevent double toggle if checkbox clicked directly
            className="fs-5 shadow-sm"
          />
        </div>
      )}

      {/* Image container with fixed aspect ratio */}
      <div
        style={{
          height: '200px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.imagePath ? (
          <Card.Img
            variant="top"
            src={item.imagePath}
            alt={item.name}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <span className="text-muted text-center p-3">No Image</span>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 fw-bold mb-2 text-truncate" title={item.name}>
          {item.name}
        </Card.Title>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <Badge bg="secondary" className="text-truncate" style={{ maxWidth: '70%' }}>
            {item.clothingType}
          </Badge>
          <div
            className="rounded-circle border border-secondary border-opacity-25 shadow-sm"
            style={{ backgroundColor: item.color, width: '24px', height: '24px' }}
            title={item.color}
          />
        </div>
      </Card.Body>

      {removable && onRemove && (
        <Card.Footer className="bg-white border-top-0 pt-0 text-center">
          <Button
            variant="outline-danger"
            size="sm"
            className="w-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
          >
            Remove
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ClothingCard;
