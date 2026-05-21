// ReelsSection.tsx
import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Bow } from './Moñito';
import styles from '../css/ReelsSection.module.css';

interface Post {
  id: string;
  image: string;
  likes: number;
  caption: string;
  hashtags: string;
  comments: number;
  timeAgo: string;
}

// 🔧 Reemplaza las imágenes con tus fotos reales
const POSTS: Post[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    likes: 1243,
    caption: 'Nueva colección Tote, diseñada para la mujer que lo tiene todo ✨',
    hashtags: '#NCStore #BolsosTote #ModaColombia',
    comments: 47,
    timeAgo: 'Hace 2 horas',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
    likes: 987,
    caption: 'Mini Bogotá Rose — pequeña pero poderosa 🌸',
    hashtags: '#MiniBags #NCStore #Medellín',
    comments: 31,
    timeAgo: 'Hace 5 horas',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    likes: 2318,
    caption: 'Para las noches que merecen algo especial 🌙',
    hashtags: '#BolsoNoche #NCStore #LujoColombiano',
    comments: 89,
    timeAgo: 'Hace 1 día',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    likes: 756,
    caption: 'Crossbody Luna — tu compañera de cada día 💖',
    hashtags: '#Crossbody #NCStore #AccesoriosColombia',
    comments: 24,
    timeAgo: 'Hace 2 días',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    likes: 1820,
    caption: 'Detrás de cámaras — así nacen nuestras piezas 🎬',
    hashtags: '#BTS #NCStore #HechoConAmor',
    comments: 63,
    timeAgo: 'Hace 3 días',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    likes: 3102,
    caption: 'Arte colombiano con alma propia. Esto es NC 💕',
    hashtags: '#NCStore #ModaColombiana #BolsosLujo',
    comments: 112,
    timeAgo: 'Hace 4 días',
  },
];

export const ReelsSection = () => {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSave = (id: string) =>
    setSaved((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className={styles.section}>
      <div className="container">

        {/* Header */}
        <div className={styles.sectionHeader}>
          <Bow size={24} className={styles.bow} />
          <h2 className={styles.title}>
            Síguenos en <span className={styles.cursive}>Instagram</span>
          </h2>
          <p className={styles.subtitle}>El mundo NC en cada publicación</p>
          <a
            href="https://instagram.com/TUUSUARIO"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.igHandle}
          >
            @ncstore
          </a>
        </div>

        {/* Grid de posts */}
        <div className={styles.grid}>
          {POSTS.map((post) => (
            <div key={post.id} className={styles.card}>

              {/* Header del post */}
              <div className={styles.postHeader}>
                <div className={styles.avatar}>NC</div>
                <div className={styles.userInfo}>
                  <span className={styles.username}>ncstore.co</span>
                  <span className={styles.location}>Medellín, Colombia</span>
                </div>
                <button className={styles.moreBtn} aria-label="más opciones">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Imagen */}
              <div className={styles.imageWrapper}>
                <img src={post.image} alt={post.caption} className={styles.image} />
              </div>

              {/* Acciones */}
              <div className={styles.actions}>
                <div className={styles.actionsLeft}>
                  <button
                    className={`${styles.actionBtn} ${liked[post.id] ? styles.likedBtn : ''}`}
                    onClick={() => toggleLike(post.id)}
                    aria-label="me gusta"
                  >
                    <Heart
                      size={22}
                      fill={liked[post.id] ? '#e91e63' : 'none'}
                      color={liked[post.id] ? '#e91e63' : 'currentColor'}
                    />
                  </button>
                  <button className={styles.actionBtn} aria-label="comentar">
                    <MessageCircle size={22} />
                  </button>
                  <button className={styles.actionBtn} aria-label="compartir">
                    <Send size={20} />
                  </button>
                </div>
                <button
                  className={`${styles.actionBtn} ${saved[post.id] ? styles.savedBtn : ''}`}
                  onClick={() => toggleSave(post.id)}
                  aria-label="guardar"
                >
                  <Bookmark
                    size={22}
                    fill={saved[post.id] ? '#c2185b' : 'none'}
                    color={saved[post.id] ? '#c2185b' : 'currentColor'}
                  />
                </button>
              </div>

              {/* Likes */}
              <div className={styles.likesRow}>
                {liked[post.id] ? post.likes + 1 : post.likes} Me gusta
              </div>

              {/* Caption */}
              <div className={styles.captionRow}>
                <span className={styles.captionUser}>ncstore.co</span>{' '}
                {post.caption}
              </div>
              <div className={styles.hashtags}>{post.hashtags}</div>

              {/* Footer */}
              <div className={styles.footer}>
                <span className={styles.commentsLink}>
                  Ver los {post.comments} comentarios
                </span>
                <span className={styles.timeAgo}>{post.timeAgo}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};