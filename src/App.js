import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card, ListGroup, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;


function App() {

  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Api acces token
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'

      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))

  }, [])

  // Search
  async function search() {
    //console.log("search for" + searchInput); // Taylor swift

    // Get request using search to get the artist ID
    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken

      }
      //body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET


    }

    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => { return data.artists.items[0].id })
    //then(data => console.log(data))
    //console.log('Artist id is: ', artistID)

    // Get request with artist ID, grab all the albums from that artist
    var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => {
        //console.log(data)
        setAlbums(data.items)
      })

  }

  async function getTracks(albumID) {
    var trackParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    var trackList = await fetch(`https://api.spotify.com/v1/albums/${albumID}/tracks`, trackParameters)
      .then(response => response.json())
      .then(data => setTracks(data.items));

    console.log(tracks);
  }

  return (
    <div className="App">
      <h1 className='mt-3'>Spotify Search App</h1>
      <h3 className="text-center mt-4">
        This is a simple app where you can enter an artist's name, view their albums, and see the tracklist of each album.
      </h3>
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Enter the Name of the Artist"
            type="input"
            onKeyDown={event => {
              if (event.key == "Enter") {
                //console.log("Pressed Enter")
                search()
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}
            style={{ backgroundColor: "#1DB954", borderColor: "#1DB954" }}
          >
            Search
          </Button>
        </InputGroup>
      </Container>


      <Container>
        <Row className="mx-2">
          {/* Coluna de albums */}
          <Col md={8}>
            <h2>Albums</h2>
            <Row className="row-cols-1 row-cols-md-4 g-4">
              {albums.map((album, i) => (
                <Col key={i}>
                  <Card>
                    {/* Imagem do álbum com link a Spotify */}
                    <Card.Img
                      src={album.images[0].url}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />

                    <Card.Body>
                      {/* Nome do album */}
                      <Card.Title>
                        <a
                          href={album.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          {album.name}
                        </a>
                      </Card.Title>
                      {/* Botão para os tracks */}
                      <Button
                        variant="primary"
                        onClick={() => getTracks(album.id)}
                        style={{ backgroundColor: "#1DB954", borderColor: "#1DB954" }}
                      >
                        View Tracks
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Coluna de Tracks */}
          <Col md={4}>
            <h2 className="mt-3">Tracks</h2>
            <ListGroup>
              {tracks.length > 0 ? (
                tracks.map((track, i) => (
                  <ListGroup.Item key={i}>
                    {/* Link para redirecionar para a música no Spotify */}
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "black", cursor: "pointer" }}
                      className="track-link"
                    >
                      {track.track_number}. {track.name}
                    </a>
                  </ListGroup.Item>
                ))
              ) : (
                <p></p>
              )}
            </ListGroup>
          </Col>
        </Row>
      </Container>


    </div>
  );
}

export default App;
