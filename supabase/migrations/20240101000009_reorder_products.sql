-- Put Glow Serum first since it's the only product currently available
UPDATE products SET sort_order = 1 WHERE slug = 'glow-serum';
UPDATE products SET sort_order = 2 WHERE slug = 'shine-shampoo';
UPDATE products SET sort_order = 3 WHERE slug = 'beauty-gummies';
