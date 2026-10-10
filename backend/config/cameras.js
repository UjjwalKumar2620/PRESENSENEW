/**
 * Camera configuration – maps camera IDs to video filenames.
 * Videos are located at the PROJECT ROOT (not in backend/ or videos/).
 * These are prerecorded demo feeds, not live streams.
 */

const CAMERAS = [
  {
    id: 'CAM-01',
    name: 'Camera 01',
    filename: '12308421-hd_1920_1080_25fps.mp4',
    resolution: '1920×1080',
    fps: 25,
    location: 'Entrance Lobby',
    status: 'recorded',
  },
  {
    id: 'CAM-02',
    name: 'Camera 02',
    filename: '13090555_3840_2160_30fps.mp4',
    resolution: '3840×2160',
    fps: 30,
    location: 'Parking Lot A',
    status: 'recorded',
  },
  {
    id: 'CAM-03',
    name: 'Camera 03',
    filename: '13597453_3840_2160_24fps.mp4',
    resolution: '3840×2160',
    fps: 24,
    location: 'Main Corridor',
    status: 'recorded',
  },
  {
    id: 'CAM-04',
    name: 'Camera 04',
    filename: '13875587_3840_2160_24fps.mp4',
    resolution: '3840×2160',
    fps: 24,
    location: 'Server Room',
    status: 'recorded',
  },
  {
    id: 'CAM-05',
    name: 'Camera 05',
    filename: '14749345_3840_2160_30fps.mp4',
    resolution: '3840×2160',
    fps: 30,
    location: 'East Wing',
    status: 'recorded',
  },
  {
    id: 'CAM-06',
    name: 'Camera 06',
    filename: '15411974_2160_3840_24fps.mp4',
    resolution: '2160×3840',
    fps: 24,
    location: 'Stairwell B',
    status: 'recorded',
  },
  {
    id: 'CAM-07',
    name: 'Camera 07',
    filename: '15853928_2160_3840_30fps.mp4',
    resolution: '2160×3840',
    fps: 30,
    location: 'Loading Dock',
    status: 'recorded',
  },
  {
    id: 'CAM-08',
    name: 'Camera 08',
    filename: '16855083_2160_3840_60fps.mp4',
    resolution: '2160×3840',
    fps: 60,
    location: 'Rooftop',
    status: 'recorded',
  },
  {
    id: 'CAM-09',
    name: 'Camera 09',
    filename: '19085074-uhd_2160_3840_60fps.mp4',
    resolution: '2160×3840',
    fps: 60,
    location: 'Emergency Exit',
    status: 'recorded',
  },
];

module.exports = { CAMERAS };
