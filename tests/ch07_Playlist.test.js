import { List, Set, Record, UnionType, Show, Eq, Ord } from "../src/libs.js";

function User(value) {
  return new String(value);
}

function Artist(value) {
  return new String(value);
}

const Song = Record({
  artist: Artist(),
  title: '',
});

const MusicGenre = UnionType('MusicGenre', {
  House: [],
  Funk: [],
  HipHop: [],
});
const { House, Funk, HipHop } = MusicGenre;

const PlaylistKind = UnionType('PlaylistKind', {
  CuratedByUser: ['user'],
  BasedOnArtist: ['artist'],
  BasedOnGenres: ['genres']
});
const { CuratedByUser, BasedOnArtist, BasedOnGenres } = PlaylistKind;

const Playlist = Record({
  name: '',
  kind: CuratedByUser(),
  songs: List.of(Song())
});

test('ch07_Playlist', () => {
  const fooFighters = Artist("Foo Fighters")
  const playlist1 = Playlist({
    name: "This is Foo Fighters",
    kind: BasedOnArtist({ artist: fooFighters }),
    songs: List.of(
      Song({ artist: fooFighters, title: "Breakout" }),
      Song({ artist: fooFighters, title: "Learn To Fly" }),
    )
  })

  const playlist2 = Playlist({
    name: "Deep Focus",
    kind: BasedOnGenres({ genres: Set.of(House, Funk) }),
    songs: List.of(
      Song({ artist: Artist("Daft Punk"), title: "One More Time" }),
      Song({ artist: Artist("The Chemical Brothers"), title: "Hey Boy Hey Girl" })
    )
  })

  const playlist3 = Playlist({
    name: "My Playlist",
    kind: CuratedByUser(User("Michał Płachta")),
    songs: List.of(
      Song({ artist: fooFighters, title: "My Hero" }),
      Song({ artist: Artist("Iron Maiden"), title: "The Trooper" })
    )
  })

  /**
   * 
   * @param {List<Playlist>} playlists 
   * @param {Artist} searchedArtist 
   * @param {MusicGenre} genre 
   */
  function gatherSongs(playlists, searchedArtist, genre) {
    return playlists.reduce((songs, playlist) => {
      const matchingSongs = playlist.kind.caseOf({
        CuratedByUser: ({user}) => playlist.songs.filter(song => song.artist === searchedArtist),
        BasedOnArtist: ({artist}) => artist === searchedArtist ? playlist.songs : List(),
        BasedOnGenres: ({genres}) => genres.contains(genre) ? playlist.songs : List()
      });
      return songs.concat(matchingSongs);
    }, List());
  }

  expect(
    gatherSongs(List.of(playlist1, playlist2, playlist3), fooFighters, Funk)
  ).toEqual(
    playlist1.songs.concat(playlist2.songs).push(Song({ artist: fooFighters, title: "My Hero" }))
  )
});
