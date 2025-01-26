import requests
from pydub import AudioSegment
import os
import re

# Directory to store downloaded segments
DOWNLOAD_DIR = "segments"
MERGED_FILE = "merged_audio.mp3"

# Ensure the download directory exists
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def extract_file_id(input_str):
    """Extract the file ID from the provided URL or return it if it's already an ID."""
    if re.match(r"^[a-f0-9\-/]{36,}$", input_str):
        return input_str  # Input is already an ID
    match = re.search(r"/media/split/(.*?/.*?)/", input_str)
    if match:
        return match.group(1)
    else:
        raise ValueError("Invalid input. Provide a valid URL or file ID.")

def get_base_url(file_id, vocals):
    """Construct the base URL based on file ID and vocals/no vocals."""
    vocals_path = "no_vocals_playlist" if not vocals else "vocals_playlist"
    return f"https://d.lalal.ai/media/split/{file_id}/{vocals_path}/segment-"

def download_segment(base_url, segment_number):
    """Download a single segment by its number."""
    url = f"{base_url}{segment_number:03}.mp3"
    file_path = os.path.join(DOWNLOAD_DIR, f"segment-{segment_number:03}.mp3")

    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(file_path, "wb") as file:
                for chunk in response.iter_content(chunk_size=1024):
                    file.write(chunk)
            print(f"Downloaded: {file_path}")
            return file_path
        else:
            print(f"Segment {segment_number} not found.")
            return None
    except Exception as e:
        print(f"Error downloading segment {segment_number}: {e}")
        return None

def merge_segments(segment_files):
    """Merge a list of audio segments into a single file."""
    merged = AudioSegment.empty()

    for file in segment_files:
        audio = AudioSegment.from_file(file)
        merged += audio

    merged.export(MERGED_FILE, format="mp3")
    print(f"Merged audio saved as {MERGED_FILE}")

def main():
    input_str = input("Enter the URL of the segment or ID: ").strip()
    try:
        file_id = extract_file_id(input_str)
        print(f"File id found: {file_id}")
    except ValueError as e:
        print(e)
        return

    vocals_input = input("Output vocals? (yes/no): ").strip().lower()
    vocals = vocals_input == "yes" or vocals_input == "y"

    base_url = get_base_url(file_id, vocals)

    segment_files = []
    segment_number = 0

    while True:
        file_path = download_segment(base_url, segment_number)
        if file_path:
            segment_files.append(file_path)
        else:
            break
        segment_number += 1

    if segment_files:
        merge_segments(segment_files)
    else:
        print("No segments downloaded.")

if __name__ == "__main__":
    main()