<?php
$args = array(
    'post_type' => 'events',
    'posts_per_page' => 3,
    'post_status' => 'publish'
);

$events = new WP_Query($args);
?>

<?php if ( $events->have_posts() ) : ?>
    <div class="list-events">
        <?php while ( $events->have_posts() ) : $events->the_post(); ?>
            <?php get_template_part('template-parts/components/event') ?>
        <?php endwhile; ?>
        <?php wp_reset_query(); ?>
    </div>
<?php endif;