# Download and Merge Audio Segments

This project provides a Python script for downloading audio segments from Lalal.ai and merging them into a single audio file. It can be run as a standalone Python script or in Google Colab for convenience.

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/G0razd/lalal.ai-downloader/blob/main/Lalal_Ai_Downloader.ipynb)

## Features
- Extracts file IDs from provided URLs or directly uses file IDs.
- Downloads audio segments sequentially from Lalal.ai.
- Merges downloaded segments into a single MP3 file.
- Handles both vocals and no-vocals playlists based on user input.
- Outputs the merged file and allows downloading it directly in Colab (if used).

## Prerequisites
- Python 3.7+
- Required Python libraries:
  - `requests`
  - `pydub`
  - `os`
  - `re`
  - (Optional) `google.colab` (if using in Colab)
- FFmpeg installed on your system for audio processing.

To install the necessary dependencies locally, use:
```bash
pip install requests pydub
```

If using in Colab, install additional dependencies:
```python
!pip install pydub
!apt-get install ffmpeg
```

## How to Use

### Standalone Script
1. **Download the Script**:
   - Save the script to a local file, e.g., `lalal_downloader.py`.

2. **Run the Script**:
   - Open a terminal or command prompt and run the script:
     ```bash
     python lalal_downloader.py
     ```

3. **Provide Input**:
   - When prompted, enter either:
     - A full Lalal.ai URL (e.g., `https://d.lalal.ai/media/split/userid/fileid/vocals_playlist/segment-000.mp3`)
     - A file ID (e.g., `userid/fileid`).

4. **Choose Playlist**:
   - Specify whether you want the vocals (`yes`) or no-vocals (`no`) playlist.

5. **Download and Merge**:
   - The script will download all available segments and merge them into a single MP3 file named `merged_audio.mp3`.

### Using in Google Colab
1. **Upload the Script**:
   - Upload the script to a Colab notebook or copy its content into a code cell.

2. **Run the Notebook**:
   - Execute the cells in sequence.

3. **Provide Input and Merge**:
   - Follow the same steps as in the standalone script.

4. **Download the File**:
   - The merged file will be downloadable directly in Colab.

## Example Usage
### Input
```
Enter the URL of the segment or ID: https://d.lalal.ai/media/split/298a10ab-c995-3515-599c-3c81e2118c9c/6ebdd5eb-5s9b-489f-aba0-7389d0a713e4/vocals_playlist/segment-000.mp3
Include vocals? (yes/no): yes
```

### Output
- Individual segments downloaded to the `segments` directory.
- Merged audio saved as `merged_audio.mp3`.
- File automatically downloads via Colab.

## Notes
- Ensure the song is fully converted on Lalal.ai to access all segments. The script won't work on preview segments.
- The script automatically downloads and merges all available segments.

## License
This project is open-source and available under the MIT License.

