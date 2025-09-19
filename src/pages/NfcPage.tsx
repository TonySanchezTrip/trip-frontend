import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface TlaxcalaContent {
  title: string;
  description: string;
  facts: string[];
}

const NfcPage: React.FC = () => {
  const { tagId } = useParams<{ tagId: string }>();
  const [nfcStatus, setNfcStatus] = useState<string>('Presiona el botón para escanear.');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [tlaxcalaContent, setTlaxcalaContent] = useState<TlaxcalaContent | null>(null);
  const [contentLoading, setContentLoading] = useState<boolean>(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // Fetch Tlaxcala content from backend
  useEffect(() => {
    const fetchTlaxcalaContent = async () => {
      setContentLoading(true);
      setContentError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/nfc-content/${tagId}`);
        if (!response.ok) {
          throw new Error('Error al cargar el contenido de Tlaxcala.');
        }
        const data: TlaxcalaContent = await response.json();
        setTlaxcalaContent(data);
      } catch (error: any) {
        setContentError(error.message);
      } finally {
        setContentLoading(false);
      }
    };

    fetchTlaxcalaContent();
  }, [tagId]); // Re-fetch if tagId changes

  const handleNfcScan = async () => {
    if ('NDEFReader' in window) {
      try {
        const ndef = new window.NDEFReader();
        await ndef.scan();
        setNfcStatus('Listo para escanear. Acerca una tarjeta NFC a tu dispositivo.');
        ndef.onreadingerror = () => {
          setNfcStatus('Error al leer la tarjeta NFC. Inténtalo de nuevo.');
        };
        ndef.onreading = event => {
          const { serialNumber } = event;
          setNfcStatus(`¡Tarjeta leída! Número de serie: ${serialNumber}`);
        };
      } catch (error) {
        console.error('Error con la API de Web NFC:', error);
        setNfcStatus('Hubo un error al iniciar el escáner NFC.');
      }
    } else {
      setNfcStatus('La API de Web NFC no es compatible con este navegador.');
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedPhoto(event.target.files[0]);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedVideo(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadStatus('Subiendo archivos...');

    if (!selectedPhoto || !selectedVideo) {
      setUploadStatus('Error: Por favor, selecciona una foto y un video.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedPhoto);
    formData.append('video', selectedVideo);

    try {
      const response = await fetch(`http://localhost:3001/api/upload/${tagId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor.');
      }

      const result = await response.json();
      console.log('Respuesta del servidor:', result);
      setUploadStatus('¡Archivos subidos con éxito!');

    } catch (error) {
      console.error('Error al subir los archivos:', error);
      setUploadStatus('Error al subir los archivos. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2 className="text-center mb-4">Contenido para la Tarjeta NFC</h2>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">ID de la Tarjeta (desde URL): {tagId}</h5>
              <hr />
              
              {/* Base Content Section */}
              <div className="mb-4">
                <h6>Información de Tlaxcala</h6>
                {contentLoading && <p>Cargando información...</p>}
                {contentError && <p className="text-danger">Error: {contentError}</p>}
                {tlaxcalaContent && (
                  <div>
                    <h5>{tlaxcalaContent.title}</h5>
                    <p className="card-text">{tlaxcalaContent.description}</p>
                    <h6>Datos Interesantes:</h6>
                    <ul>
                      {tlaxcalaContent.facts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Web NFC Section */}
              <div className="text-center mb-4">
                <h6>Escanear Tarjeta NFC</h6>
                <button className="btn btn-primary" onClick={handleNfcScan}>Escanear NFC</button>
                <p className="mt-3">{nfcStatus}</p>
              </div>
              <hr />

              {/* User Upload Section */}
              <div>
                <h6 className="text-center mb-3">Tu Contenido Personalizado</h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="photoInput" className="form-label">Sube 1 Foto</label>
                    <input className="form-control" type="file" id="photoInput" accept="image/*" onChange={handlePhotoChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="videoInput" className="form-label">Sube 1 Video</label>
                    <input className="form-control" type="file" id="videoInput" accept="video/*" onChange={handleVideoChange} />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-success">Subir Contenido</button>
                  </div>
                  {uploadStatus && <p className="mt-3 text-center">{uploadStatus}</p>}
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NfcPage;
