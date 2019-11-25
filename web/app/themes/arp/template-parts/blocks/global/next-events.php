<?php
$les_evenements = get_field('les_evenements');

if ( $les_evenements ) :
?>
<div class="block-events mt-0">
    <div class="wrapper">
        <div class="content">
            <h2><?= $les_evenements['title'] ?></h2>
            <p class="des"><?= $les_evenements['des'] ?></p>
            <a href="<?= $les_evenements['button']['url'] ?>" class="btn-arrow" target="<?= $les_evenements['button']['target'] ?>"><?= $les_evenements['button']['title'] ?> <i class="i-arrow-right"></i></a>
        </div>
        <?php get_template_part('template-parts/components/three-next-events') ?>
    </div>
</div>
<?php endif;
