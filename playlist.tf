data "spotify_search_track" "top_tracks" {
  artist = var.artist_name
  limit  = 5
}

resource "spotify_playlist" "artist_top_5" {
  name        = "Terraform Playlist: ${var.artist_name}"
  description = "Top tracks of ${var.artist_name} created with Terraform"
  public      = false

  tracks = [
    for t in data.spotify_search_track.top_tracks.tracks : t.id
  ]
}