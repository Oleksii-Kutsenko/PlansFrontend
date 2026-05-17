import { FC, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

interface ImageColorPickerProps {
  imageFile: File | null;
  onColorPick: (hex: string) => void;
}

const ImageColorPicker: FC<ImageColorPickerProps> = ({ imageFile, onColorPick }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Generate an object URL for the uploaded file
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImgSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setImgSrc(null);
  }, [imageFile]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    // Render the image to an offscreen canvas to read the exact pixel
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    // Calculate click coordinates mapped to the natural image resolution
    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;

    if (pixel[0] === undefined || pixel[1] === undefined || pixel[2] === undefined) {
      throw new Error('Pixel data is incomplete');
    } else {
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      onColorPick(hex);
    }
  };

  if (!imgSrc) return null;

  return (
    <div className="mt-3">
      <Form.Text className="text-primary fw-medium mb-2 d-block fs-6">
        <i className="bi bi-eyedropper me-2"></i>
        Click anywhere on the photo to auto-pick the main color!
      </Form.Text>
      <div
        style={{
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          padding: '4px',
          display: 'inline-block',
          backgroundColor: '#f8f9fa',
        }}
      >
        <img
          src={imgSrc}
          alt="Preview"
          onClick={handleImageClick}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            height: 'auto',
            display: 'block',
            cursor: 'crosshair',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
};

export default ImageColorPicker;
