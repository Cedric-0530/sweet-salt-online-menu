#!/bin/bash
for dir in "/Users/yanmu/Desktop/sweet & salt online menu/image" "/Users/yanmu/Desktop/Sweet & Salt Menu/Image"; do
  if [ -d "$dir" ]; then
    cd "$dir"
    for img in *.JPG *.png; do
      if [[ "$img" == *"favicon"* ]] || [[ "$img" == *"apple-touch"* ]] || [[ "$img" == *"logo"* ]] || [[ "$img" == *"图片logo"* ]] || [[ "$img" == *"文字logo"* ]]; then
        echo "Skipping $img"
        continue
      fi
      if [ -f "$img" ]; then
        base="${img%.*}"
        opt_name="${base}_opt.jpg"
        final_name="${base}.jpg"
        
        echo "Converting $img to $final_name"
        sips -Z 800 -s format jpeg -s formatOptions 70 "$img" --out "$opt_name"
        if [ -f "$opt_name" ]; then
          rm "$img"
          mv "$opt_name" "$final_name"
        fi
      fi
    done
  fi
done
