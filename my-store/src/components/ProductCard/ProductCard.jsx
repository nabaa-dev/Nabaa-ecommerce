import { useCart } from '../../context/CartContext';
import { StarIcon, ShoppingCartIcon, TagIcon, ImageIcon } from '../Icons';
import './ProductCard.css';

const CATEGORY_COLORS = {
  'إلكترونيات':   { bg: '#0284c7', glow: 'rgba(2,132,199,0.4)'   },
  'ملابس':        { bg: '#7c3aed', glow: 'rgba(124,58,237,0.4)'  },
  'أجهزة منزلية': { bg: '#0d9488', glow: 'rgba(13,148,136,0.4)' },
  'رياضة':        { bg: '#059669', glow: 'rgba(5,150,105,0.4)'   },
  'كتب':          { bg: '#b45309', glow: 'rgba(180,83,9,0.4)'    },
  'جمال وعناية': { bg: '#be185d', glow: 'rgba(190,24,93,0.4)'   },
};
const FALLBACK_COLORS = [
  { bg: '#0d9488', glow: 'rgba(13,148,136,0.4)' },
  { bg: '#0284c7', glow: 'rgba(2,132,199,0.4)'  },
  { bg: '#7c3aed', glow: 'rgba(124,58,237,0.4)' },
];

function getColorForProduct(product) {
  if (product.category && CATEGORY_COLORS[product.category]) {
    return CATEGORY_COLORS[product.category];
  }
  return FALLBACK_COLORS[(product.id || 0) % FALLBACK_COLORS.length];
}

function StarRating({ rating = 4.2 }) {
  return (
    <div className="product-card__stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1,2,3,4,5].map((s) => (
        <StarIcon
          key={s}
          size={13}
          filled={s <= Math.round(rating)}
          className={s <= Math.round(rating) ? 'star--filled' : 'star--empty'}
        />
      ))}
      <span className="product-card__rating-value">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const color = getColorForProduct(product);
  const rating = product.rating || (3.8 + ((product.id || 1) * 0.13) % 1.1);

  return (
    <article className="product-card">
      <div className="product-card__shine" aria-hidden="true" />

      {/* Image */}
      <div className="product-card__img-wrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="product-card__img-placeholder"
          style={{ display: product.image ? 'none' : 'flex' }}
        >
          <ImageIcon
            size={52}
            className="product-card__placeholder-icon"
            style={{ color: color.bg }}
          />
        </div>

        {/* Category Badge */}
        {product.category && (
          <span
            className="product-card__badge"
            style={{
              background: color.bg,
              boxShadow: `0 4px 14px ${color.glow}`,
            }}
          >
            <TagIcon size={9} />
            {product.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="product-card__content">
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}
        <StarRating rating={rating} />

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-symbol">$</span>
            <span className="product-card__price-value">
              {Number(product.price).toFixed(2)}
            </span>
          </div>
          <button
            id={`add-to-cart-${product.id}`}
            className="product-card__btn"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartIcon size={15} />
            <span>أضف للسلة</span>
          </button>
        </div>
      </div>
    </article>
  );
}
