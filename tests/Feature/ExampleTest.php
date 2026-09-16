<?php

test('guests reach login from the home page', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
