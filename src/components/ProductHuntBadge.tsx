import React from 'react';

const ProductHuntBadge = () => {
    return (
        <div className="text-center sm:col-span-2 lg:col-span-1 lg:text-right flex flex-col items-center lg:items-end gap-4">
            <a
                href="https://www.producthunt.com/products/your-private-room-for-ldr?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-your&#0045;private&#0045;room&#0045;for&#0045;ldr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90 transition-opacity"
            >
                <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1043838&theme=light&t=1764416786705"
                    alt="Your Private Room for LDR - Long distance relationships (LDR) we got a solution for you | Product Hunt"
                    style={{ width: '250px', height: '54px' }}
                    width="250"
                    height="54"
                />
            </a>
            <p className="text-xs sm:text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Togetherly. All Rights Reserved.</p>
        </div>
    );
};

export default ProductHuntBadge;
