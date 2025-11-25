# ColorSpace Lab

**ColorSpace Lab** is an interactive educational tool designed for Computer Vision students. It allows users to visualize, compare, and understand various 3D color models and the mathematics behind image channel separation.

![App Screenshot](./ColorSpaceLab.png)

> **Note:** This application uses the **Google Gemini API** to provide real-time, expert-level explanations for each color model.

## Features

### 1. Interactive 3D Space Visualizer
Visualize how colors are distributed in 3D space for different models.
- **RGB**: The standard cube.
- **HSV / HSL / HSI**: Cylindrical and conical representations.
- **Lab**: Perceptually uniform spherical/blob shape.
- **CMYK**: Subtractive color cube.
- **YCbCr**: Luma/Chroma separation.

### 2. Image Channel Splitter
Upload any image to decompose it into its constituent channels based on the selected color model. This helps students understand concepts like:
- Why **HSV** is better for color thresholding.
- How **YCbCr** separates luminance for compression.
- How **CMYK** handles ink separation.

### 3. AI Professor (Gemini Powered)
An integrated AI assistant that provides:
- Mathematical definitions of coordinate systems.
- Practical use cases in Computer Vision (e.g., segmentation, perception, printing).
- Real-time analysis of channel utility.

## Supported Color Models
- **RGB** (Red, Green, Blue)
- **CMYK** (Cyan, Magenta, Yellow, Key)
- **HSV** (Hue, Saturation, Value)
- **HSL** (Hue, Saturation, Lightness)
- **HSI** (Hue, Saturation, Intensity)
- **Lab** (CIE L*a*b*)
- **YCbCr** (Luminance, Chroma Blue, Chroma Red)

## Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Graphics**: HTML5 Canvas (Custom 3D point cloud engine)
- **AI**: Google GenAI SDK (`@google/genai`)

## Setup

1. Clone the repository.
2. Create a `.env` file with your Gemini API Key:
   ```env
   API_KEY=your_google_api_key_here
   ```
3. Install dependencies and run.
