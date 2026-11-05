import os
import sys
import json
import subprocess
import tempfile
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8080
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
EXPORTS_DIR = os.path.join(CURRENT_DIR, "exports")
GAME_BGM_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "audio", "bgm"))

os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(GAME_BGM_DIR, exist_ok=True)

class MidiStudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CURRENT_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save-game':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                raw_name = data.get('song_name', 'MidiSuno_BGM')
                wav_bytes = data.get('wav_bytes', [])
                midi_bytes = data.get('midi_bytes', [])
                loop_start_sec = float(data.get('loop_start_sec', 0.0))
                loop_length_sec = float(data.get('loop_length_sec', 0.0))

                # Sanitize song filename
                safe_name = "".join(c for c in raw_name if c.isalnum() or c in ('_', '-'))
                if not safe_name:
                    safe_name = "MidiSuno_BGM"

                print(f"\n[MidiSuno] Processing game audio export for: {safe_name}")

                # 1. Save temporary WAV file
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
                    temp_wav.write(bytes(wav_bytes))
                    temp_wav_path = temp_wav.name

                # Target files in exports/
                ogg_export = os.path.join(EXPORTS_DIR, f"{safe_name}.ogg")
                m4a_export = os.path.join(EXPORTS_DIR, f"{safe_name}.m4a")
                mid_export = os.path.join(EXPORTS_DIR, f"{safe_name}.mid")

                # Target files in audio/bgm/ (Game folder)
                ogg_game = os.path.join(GAME_BGM_DIR, f"{safe_name}.ogg")
                m4a_game = os.path.join(GAME_BGM_DIR, f"{safe_name}.m4a")
                mid_game = os.path.join(GAME_BGM_DIR, f"{safe_name}.mid")

                # 2. Save MIDI
                if midi_bytes:
                    with open(mid_export, 'wb') as f:
                        f.write(bytes(midi_bytes))
                    with open(mid_game, 'wb') as f:
                        f.write(bytes(midi_bytes))

                # 3. Calculate RPG Maker loop points in samples (44100 Hz)
                sample_rate = 44100
                loop_start_sample = int(loop_start_sec * sample_rate)
                loop_length_sample = int(loop_length_sec * sample_rate)

                # 4. Convert WAV to OGG with RPG Maker Loop Comments
                ogg_cmd = [
                    "ffmpeg", "-y", "-i", temp_wav_path,
                    "-c:a", "libvorbis", "-q:a", "5",
                    "-metadata", f"LOOPSTART={loop_start_sample}",
                    "-metadata", f"LOOPLENGTH={loop_length_sample}",
                    ogg_export
                ]
                print(f"[MidiSuno] Encoding OGG with Vorbis loop metadata...")
                subprocess.run(ogg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                # 5. Convert WAV to M4A (AAC 192k)
                m4a_cmd = [
                    "ffmpeg", "-y", "-i", temp_wav_path,
                    "-c:a", "aac", "-b:a", "192k",
                    m4a_export
                ]
                print(f"[MidiSuno] Encoding M4A (AAC)...")
                subprocess.run(m4a_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                # Copy OGG & M4A to game audio/bgm/
                import shutil
                shutil.copyfile(ogg_export, ogg_game)
                shutil.copyfile(m4a_export, m4a_game)

                # Cleanup temp WAV
                try:
                    os.remove(temp_wav_path)
                except Exception:
                    pass

                print(f"[MidiSuno] SUCCESS! Saved to both audio/bgm/ and midi/exports/:")
                print(f"  -> {safe_name}.ogg")
                print(f"  -> {safe_name}.m4a")
                print(f"  -> {safe_name}.mid")

                response = {
                    "status": "success",
                    "song_name": safe_name,
                    "ogg_file": f"audio/bgm/{safe_name}.ogg",
                    "m4a_file": f"audio/bgm/{safe_name}.m4a",
                    "mid_file": f"audio/bgm/{safe_name}.mid",
                    "message": f"Saved {safe_name}.ogg and {safe_name}.m4a directly to your game BGM folder!"
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                print(f"[MidiSuno] Error processing save-game: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "error": str(e)}).encode('utf-8'))

        elif self.path == '/api/convert-audio':
            # Endpoint to return binary OGG or M4A for direct browser download
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                target_format = data.get('format', 'ogg').lower() # 'ogg' or 'm4a'
                wav_bytes = data.get('wav_bytes', [])
                safe_name = "".join(c for c in data.get('song_name', 'song') if c.isalnum() or c in ('_', '-'))

                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
                    temp_wav.write(bytes(wav_bytes))
                    temp_wav_path = temp_wav.name

                out_ext = ".ogg" if target_format == "ogg" else ".m4a"
                with tempfile.NamedTemporaryFile(suffix=out_ext, delete=False) as temp_out:
                    temp_out_path = temp_out.name

                if target_format == "ogg":
                    cmd = ["ffmpeg", "-y", "-i", temp_wav_path, "-c:a", "libvorbis", "-q:a", "5", temp_out_path]
                    content_type = "audio/ogg"
                else:
                    cmd = ["ffmpeg", "-y", "-i", temp_wav_path, "-c:a", "aac", "-b:a", "192k", temp_out_path]
                    content_type = "audio/mp4"

                subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                with open(temp_out_path, 'rb') as f:
                    out_bytes = f.read()

                try:
                    os.remove(temp_wav_path)
                    os.remove(temp_out_path)
                except Exception:
                    pass

                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Disposition', f'attachment; filename="{safe_name}{out_ext}"')
                self.send_header('Content-Length', str(len(out_bytes)))
                self.end_headers()
                self.wfile.write(out_bytes)

            except Exception as e:
                print(f"[MidiSuno] Error converting audio: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "error": str(e)}).encode('utf-8'))
        elif self.path == '/api/fetch-online-midi':
            # Download a remote MIDI file from the internet for the AI to learn
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                import urllib.request
                data = json.loads(post_data.decode('utf-8'))
                target_url = data.get('url', '').strip()

                if not target_url.startswith('http://') and not target_url.startswith('https://'):
                    raise ValueError("URL must start with http:// or https://")

                print(f"[MidiSuno] Fetching online MIDI from: {target_url}")
                req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(req, timeout=12) as response:
                    midi_bytes = response.read()

                print(f"[MidiSuno] Downloaded {len(midi_bytes)} bytes from web!")
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "bytes": list(midi_bytes),
                    "size": len(midi_bytes),
                    "url": target_url
                }).encode('utf-8'))

            except Exception as e:
                print(f"[MidiSuno] Error fetching online MIDI: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "error": str(e)}).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MidiStudioHandler)
    url = f"http://localhost:{PORT}"
    print("=" * 65)
    print(f"  MidiSuno Studio server is running at: {url}")
    print(f"  Game BGM directory: {GAME_BGM_DIR}")
    print(f"  Exports directory: {EXPORTS_DIR}")
    print("  Supports instant conversion: WAV -> OGG (libvorbis) & M4A (AAC)")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 65)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping MidiSuno Studio server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
